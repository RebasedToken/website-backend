require("dotenv").config()
const run = require("../src/sync-blocks")
const cron = require("node-cron")

// every 5 minutes
cron.schedule("*/5 * * * *", async function () {
  console.log("running at", new Date())
  run(true)
})
