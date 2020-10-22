require("dotenv").config()
const HDWalletProvider = require("@truffle/hdwallet-provider")
const Web3 = require("web3")

exports.Web3 = function () {
  const provider = new HDWalletProvider(
    process.env.MNENOMIC,
    process.env.WEB3_PROVIDER,
    0
  )

  return new Web3(provider)
}

exports.Contract = class {
  constructor(web3, name, address) {
    const abi = require(`../abis/${name}.json`)
    this.contract = new web3.eth.Contract(abi, address)
  }

  async read(method, args = [], block) {
    return new Promise((resolve, reject) => {
      const args2 = [{}]
      if (block) args2.push(block)
      this.contract.methods[method](...args).call(...args2, (err, response) => {
        if (err) {
          return reject(new Error(err.message))
        }
        if (response.c && response.c.length) {
          return resolve(response.c)
        }
        resolve(response)
        // resolve(response.c?.[0] ?? response);
      })
    })
  }
}
