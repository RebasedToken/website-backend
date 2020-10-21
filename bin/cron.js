const run = require("../src/sync-blocks")
const cron = require("node-cron")

cron.schedule("5 * * * *", async function () {
  // hourly: 0005, 0105, 0205 ...
  console.log("running at", new Date())
  run()
})
