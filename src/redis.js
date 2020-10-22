const redis = require("redis")

const client = redis.createClient()

module.exports = (fn, args) =>
  new Promise((resolve, reject) =>
    client[fn](...args, (err, ret) => {
      if (err) return reject(err)
      resolve(ret)
    })
  )
