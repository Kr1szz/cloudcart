const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { cognitoValidateToken } = require("../services/cognito.service");
const logger = require("../utils/logger");

/**
 * Protect routes - Authentication Middleware
 */
const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // 1. Try local JWT verify first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "cloudcart_secret_session_key_production_2026_mca_project");
      
      const [rows] = await db.execute("SELECT id, username, email, role, phone, address FROM users WHERE id = ?", [decoded.id]);
      if (rows.length === 0) {
        return res.status(401).json({ message: "User no longer exists" });
      }
      
      req.user = rows[0];
      return next();
    } catch (localJwtError) {
      // Local JWT verification failed, attempt Cognito if enabled
      logger.debug("Local JWT check failed, attempting Cognito validation...", { error: localJwtError.message });
    }

    // 2. Try Cognito verification
    try {
      const cognitoUser = await cognitoValidateToken(token);
      if (cognitoUser) {
        // Find user by cognito_sub or email
        const emailAttr = cognitoUser.UserAttributes.find(attr => attr.Name === 'email');
        const email = emailAttr ? emailAttr.Value : null;
        
        let [rows] = await db.execute("SELECT id, username, email, role, phone, address FROM users WHERE cognito_sub = ? OR email = ?", [cognitoUser.Username, email]);
        
        if (rows.length === 0) {
          // Auto-create user in local DB on successful first-time Cognito login
          const username = cognitoUser.Username || email.split('@')[0];
          const [result] = await db.execute(
            "INSERT INTO users (username, email, role, cognito_sub) VALUES (?, ?, 'customer', ?)", 
            [username, email, cognitoUser.Username]
          );
          
          const [newUsers] = await db.execute("SELECT id, username, email, role, phone, address FROM users WHERE id = ?", [result.insertId]);
          rows = newUsers;
          
          // Auto-create a cart for the new user
          await db.execute("INSERT INTO cart (user_id) VALUES (?)", [result.insertId]);
        }
        
        req.user = rows[0];
        return next();
      }
    } catch (cognitoError) {
      logger.error("Cognito JWT validation also failed", { error: cognitoError.message });
    }

    return res.status(401).json({ message: "Not authorized, token validation failed" });
  } catch (error) {
    logger.error("Auth middleware error", { error: error.message });
    return res.status(500).json({ message: "Internal Server Error in authentication" });
  }
};

/**
 * Admin Role Authorization Middleware
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden, administrator access required" });
  }
};

module.exports = {
  protect,
  admin
};
