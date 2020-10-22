require("dotenv").config()
const run = require("../src/sync-blocks")

;(async function () {
  await run()
})()
  .catch(function (e) {
    console.error(e)
  })
  .finally(function () {
    process.exit()
  })
