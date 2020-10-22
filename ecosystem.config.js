module.exports = {
  apps: [
    {
      name: "www",
      script: "./bin/www.js",
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: "5000",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: "80",
      },
    },
    {
      name: "cron",
      script: "./bin/cron.js",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
}
