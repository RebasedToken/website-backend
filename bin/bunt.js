require("dotenv").config()
const {getBurntAmount} = require('../src/stats');

(async () => {
  console.log("amount", await getBurntAmount());
})().then(
  () => process.exit(),
  (err) => {
    console.log(err);
    process.exit();
  });
