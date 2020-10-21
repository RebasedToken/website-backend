const redis = require("redis")

module.exports = () => {
  const client = redis.createClient()

  return (fn, args) =>
    new Promise((resolve, reject) =>
      client[fn](...args, (err, ret) => {
        if (err) return reject(err)
        resolve(ret)
      })
    )
}
