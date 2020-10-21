const {Web3} = require("../src/web3")
const Batch = require("batch")

const MAX_THREADS = 200

const contract = "0x87F5F9eBE40786D49D35E1B5997b07cCAA8ADbFF"
const startingBlock = 10827717
const stoppingBlock = 10827720

const web3 = Web3()

if (typeof stoppingBlock === "undefined") {
  stoppingBlock = web3.eth.blockNumber
}

if (startingBlock > stoppingBlock) {
  return reject(new Error("startingBlock > stoppingBlock"))
}

const batch = new Batch()
batch.concurrency(MAX_THREADS)
for (let block = startingBlock; block <= stoppingBlock; block++) {
  ;(function (block) {
    batch.push(async (done) => {
      console.log(`block ${block}`)

      try {
        const {transactions} = await web3.eth.getBlock(block, true)
        if (transactions) {
          for (var i = 0; i < transactions.length; i++) {
            const txn = transactions[i]
            if (!txn.to) {
              const receipt = await web3.eth.getTransactionReceipt(txn.hash)
              if (
                web3.utils.toChecksumAddress(receipt.contractAddress) ===
                web3.utils.toChecksumAddress(contract)
              ) {
                console.log(receipt.blockNumber)
              }
            }
          }
        }
        done()
      } catch (e) {
        done(e)
      }
    })
  })(block)
}
batch.end((err, ret) => {
  if (err) return console.error(err)
  process.exit()
})
