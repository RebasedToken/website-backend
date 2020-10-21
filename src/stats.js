const Redis = require("../src/redis")
const moment = require("moment")
const BN = require('bn.js');
const Web3 = require("web3")

const redis = Redis()

module.exports = async function () {
  const data = {}
  data["1d"] = await get1d()
  data["30d"] = await get30d()
  data["all"] = await getAll()
  return data
}

async function get1d() {
  const getFromToForInterval = (i) => {
    const to = moment.utc().endOf("hour").add(-i, "hours")
    const from = moment(to).add(-1, "hours")
    const x = to.format("hh:mm")
    return {x, from, to}
  }

  return get(24, getFromToForInterval)
}

async function get30d() {
  const getFromToForInterval = (i) => {
    const day = moment.utc().add(-i, "days")
    const from = moment(day).startOf("day")
    const to = moment(day).endOf("day")
    const x = day.format("DD-MM-YYYY")
    return {x, from, to}
  }

  return get(30, getFromToForInterval)
}

async function getAll() {
  const getFromToForInterval = (i) => {
    const day = moment.utc().add(-i, "days")
    const from = moment(day).startOf("day")
    const to = moment(day).endOf("day")
    const x = day.format("DD-MM-YYYY")
    return {x, from, to}
  }

  return get(60, getFromToForInterval)
}

async function get(intervals, getFromToForInterval) {
  const xs = []
  const prices = []
  const supplies  = []

  for (i = 0; i < intervals; i++) {
    const {x, from, to} = getFromToForInterval(i)

    let price = bn(0)
    let supply = bn(0)
    try {
      const blockNumbers = await redis("zrangebyscore", [
        "blocks",
        from.unix(),
        to.unix(),
      ])
      const blocks = await redis("mget", blockNumbers)
      blocks.forEach((b) => {
        const {price: p, supply: s} = JSON.parse(b)
        price = price.add(bn(p))
        supply = supply.add(bn(s))
      })
      const len = bn(blocks.length.toString());
      price = price.div(len)
      supply = supply.div(len)
    } catch (e) {}

    xs.unshift(x)
    prices.unshift(Web3.utils.fromWei(price, 'ether').toString())
    supplies.unshift(Web3.utils.fromWei(supply, 'gwei').toString())
  }

  return {x: xs, p: prices, s: supplies}
}

function bn(n) {
  return new BN(n)
}