require("dotenv").config()
const run = require("../src/sync-blocks")
const cron = require("node-cron")

// every 20 minutes
cron.schedule("*/20 * * * *", async function () {
  console.log("running at", new Date())
  run(true)
})
