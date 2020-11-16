require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const rateLimit = require("express-rate-limit")
const {getStats, getTotalSupply} = require("../src/stats")
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  message:
    "Too many requests created from this IP, please try again in 5 minutes 😜",
})
const port = process.env.PORT

const app = express()
app.set("trust proxy", 1)
app.use(cors())
app.use(bodyParser.json())
app.get("/", apiLimiter, async (req, res) => {
  res.json(await getStats())
})
app.get("/total-supply", apiLimiter, async (req, res) => {
  res.json({totalSupply: parseInt(await getTotalSupply())})
})
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
