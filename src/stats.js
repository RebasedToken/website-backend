const Redis = require("../src/redis")
const moment = require("moment")

const redis = Redis()

module.exports = async function () {
  const price = {}
  price["1d"] = await get1d()
  price["30d"] = await get30d()
  price["all"] = await getAll()
  return {price}
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
  const x = []
  const abs = []
  const percentage = []

  for (i = 0; i < intervals; i++) {
    const {x: _x, from, to} = getFromToForInterval(i)
    // console.log(from.unix(), to.unix())

    let _abs = 0
    let _percentage = 0
    try {
      const blockNumbers = await redis("zrangebyscore", [
        "blocks",
        from.unix(),
        to.unix(),
      ])
      const blocks = await redis("mget", blockNumbers)
      _abs =
        blocks
          .map((b) => {
            const {price} = JSON.parse(b)
            return parseInt(price)
          })
          .reduce((o, a) => o + a, 0) / blocks.length
      const _previousAbs = abs[abs.length - 1]
      _percentage = _previousAbs
        ? Math.ceil((100 * (_abs - _previousAbs)) / _abs)
        : 0
    } catch (e) {}

    x.unshift(_x)
    abs.unshift(_abs)
    percentage.unshift(_percentage)
  }

  return {x, abs, '%': percentage}
}
