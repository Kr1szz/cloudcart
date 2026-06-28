module.exports = {
  apps: [
    {
      name: "cloudcart-api",
      script: "../../backend/server.js",
      instances: 1, // Set to 'max' for clustering on multi-core EC2
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "../logs/pm2_err.log",
      out_file: "../logs/pm2_out.log",
      combine_logs: true
    }
  ]
};
