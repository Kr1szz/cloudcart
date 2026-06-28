require("dotenv").config();
const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`CloudCart backend server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle uncaught errors
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection Error: ${err.message}`, { stack: err.stack });
  // Gracefully close server and exit process
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception Error: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});
