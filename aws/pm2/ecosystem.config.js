const path = require("path");

module.exports = {
  apps: [
    {
      name: "cloudcart-api",
      cwd: path.resolve(__dirname, "../../backend"),
      script: "server.js",
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
