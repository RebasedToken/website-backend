const Redis = require("../src/redis")
const moment = require("moment")

;(async function () {
  const redis = Redis()
  const from = moment.unix(1602656240)
  const to = moment(from).add(1, "days")
  console.log(from.unix(), to.unix())
  const blockNumbers = await redis("zrangebyscore", [
    "blocks",
    from.unix(),
    to.unix(),
  ])

  // const blockNumbers = await redis('zrange', ['blocks', 0, 30]);
  console.log({blockNumbers})
  const blocks = await redis("mget", blockNumbers)
  console.log({blocks})
})()
  .catch(function (e) {
    console.error(e)
  })
  .finally(function () {
    process.exit()
  })
