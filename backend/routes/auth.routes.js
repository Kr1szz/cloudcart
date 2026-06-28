const express = require("express");
const router = express.Router();
const { register, login, getProfile } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../middleware/validator");
const { authLimiter } = require("../middleware/rateLimiter");

// Registration route with rate limiter and input validation
router.post("/register", authLimiter, validateRegister, register);

// Login route with rate limiter and input validation
router.post("/login", authLimiter, validateLogin, login);

// Get profile (requires JWT protection)
router.get("/profile", protect, getProfile);

module.exports = router;
