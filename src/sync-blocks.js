const redis = require("./redis")
const Batch = require("batch")
const {web3, contracts, FIRST_BLOCK} = require("./contracts")

const MAX_THREADS = 9

module.exports = async function (onCurrent) {
  const latestBlock = await web3.eth.getBlockNumber()
  
  let blocks = []
  if (onCurrent) {
    blocks.push(latestBlock);
    for (let i = 0; i <= 120; i++) { // infura allows only upto 120 blocks
      blocks.push((latestBlock - i).toString())
    }
  } else {
    const startingBlock = FIRST_BLOCK
    const stoppingBlock = latestBlock
    for (let block = startingBlock; block <= stoppingBlock; block++) {
      blocks.push(block.toString())
    }
  }

  const existsInRedis = await redis("mget", blocks)

  await new Promise((resolve, reject) => {
    const batch = new Batch()
    batch.concurrency(MAX_THREADS)
    blocks.forEach((block, i) => {
      if (existsInRedis[i]) return

      batch.push(async (done) => {
        try {
          console.log(`block ${block}`)
          const {timestamp} = await web3.eth.getBlock(block, true)

          const [price, supply] = await Promise.all([
            contracts.rebasedOracle.contract.read("getData", [], block),
            contracts.rebasedV2.contract.read("totalSupply", [], block),
          ])

          await redis("zadd", ["blocks", timestamp, block])
          await redis("set", [
            block,
            JSON.stringify({price, supply, timestamp}),
          ])
          console.log("done " + block)
          done()
        } catch (e) {
          console.error("block", e.message)
          done()
        }
      })
    })
    batch.end((err, ret) => {
      if (err) return reject(err)
      console.log("done", ret.length)
      resolve()
    })
  })
}
