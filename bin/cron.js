require("dotenv").config()
const run = require("../src/sync-blocks")
const cron = require("node-cron")

// every 10 minutes
cron.schedule("*/10 * * * *", async function () {
  console.log("running at", new Date())
  run(true)
})
