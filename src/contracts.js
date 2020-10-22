const {Web3, Contract} = require("./web3")

exports.Web3 = Web3;

const web3 = exports.web3 = Web3()

const contracts = exports.contracts = {
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

for (const contractName in contracts) {
  const contract = contracts[contractName]
  contract.contract = new Contract(web3, contractName, contract.address)
}