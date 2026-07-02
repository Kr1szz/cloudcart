const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

// Import Routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// Nginx terminates the public request and forwards it to Express locally.
app.set("trust proxy", 1);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading images locally
}));
app.use(cors({
  origin: "*", // Adjust in production to frontend domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
const logFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(logFormat));

// Apply general API rate limiting to all requests
app.use("/api", apiLimiter);

// Serve static uploads folder (for S3 file storage fallback)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Health Check API
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

// Fallback 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ message: `API Route not found: ${req.method} ${req.url}` });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
