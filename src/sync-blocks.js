const {Web3, Contract} = require("../src/web3")
const Redis = require("../src/redis")
const Batch = require("batch")

const MAX_THREADS = 100

const FIRST_BLOCK = 11052142 // rebasedOracle creation block

const contracts = {
  rebasedV2: {
    address: "0x87F5F9eBE40786D49D35E1B5997b07cCAA8ADbFF",
    creationBlock: 10827718,
  },
  // rebasedController: {
  //   address: "0xeA88f3132ACe8892f8Bf9DC4352C369b51553feE",
  //   creationBlock: 1
  // },
  rebasedOracle: {
    address: "0x6680fa0e206ae96c0f852dbe5438b916580c272d",
    creationBlock: 11052142,
  },
}

module.exports = async function () {
  const web3 = Web3()
  const redis = Redis()

  const latestBlock = await web3.eth.getBlockNumber()

  for (const contractName in contracts) {
    const contract = contracts[contractName]
    contract.contract = new Contract(web3, contractName, contract.address)
  }

  const startingBlock = FIRST_BLOCK
  const stoppingBlock = latestBlock

  let blocks = []
  for (let block = startingBlock; block <= stoppingBlock; block++) {
    blocks.push(block.toString())
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
