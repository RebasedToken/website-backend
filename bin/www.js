const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const rateLimit = require("express-rate-limit")
const Redis = require("../src/redis")
const moment = require("moment")

const redis = Redis()

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  message:
    "Too many requests created from this IP, please try again in 5 minutes 😜",
})

const app = express()

app.set("trust proxy", 1)

app.use(cors())

app.use(bodyParser.json())

app.get("/", apiLimiter, async (req, res) => {
  let x = [],
    y = []

  // const from = moment.unix(1602656240)
  // const to = moment(from).add(1, "days")
  // console.log(from.unix(), to.unix())
  // const blockNumbers = await redis("zrangebyscore", [
  //   "blocks",
  //   from.unix(),
  //   to.unix(),
  // ])

  // const blockNumbers = await redis('zrangebylex', ['blocks', 0, 1000]);
  // const blocks = await redis("mget", blockNumbers)
  // blocks.forEach((b) => {
  //   const {price, timestamp} = JSON.parse(b)
  //   x.push(moment.unix(timestamp).format('DD-MM-YYYY'))
  //   y.push(price)
  // })

  for (i = 0; i < 60; i++) {
    const day = moment.utc().add(-i, "days")

    const from = moment(day).startOf("day")
    const to = moment(day).endOf("day")
    // console.log(from.unix(), to.unix())
    let avgPrice
    try {
      const blockNumbers = await redis("zrangebyscore", [
        "blocks",
        from.unix(),
        to.unix(),
      ])
      const blocks = await redis("mget", blockNumbers)
      avgPrice =
        blocks
          .map((b) => {
            const {price} = JSON.parse(b)
            return parseInt(price)
          })
          .reduce((o, a) => o + a, 0) / blocks.length
    } catch (e) {
      avgPrice = 0
    }

    x.unshift(day.format("DD-MM-YYYY"))
    y.unshift(avgPrice)
  }

  const data = {}
  const types = ["abs", "%"]
  const durations = ["30d", "60d", "90d", "1y", "all"]
  types.forEach(function (type) {
    durations.forEach(function (duration) {
      data[type] = data[type] || {}
      data[type][duration] = {
        x,
        y,
      }
    })
  })

  res.json({price: data})
})

const port = process.env.PORT
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
