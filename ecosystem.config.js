module.exports = {
  apps: [
    {
      name: "backend",
      script: "sudo node ./bin/www.js",
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      env_production: {
        NODE_ENV: "production",
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
