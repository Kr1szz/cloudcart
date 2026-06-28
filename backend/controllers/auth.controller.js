const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { cognitoRegister, cognitoLogin } = require("../services/cognito.service");
const logger = require("../utils/logger");

const generateLocalToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || "cloudcart_secret_session_key_production_2026_mca_project", 
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Register User
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  const { username, email, password, phone, address } = req.body;

  try {
    // Check if user already exists in RDS
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ? OR username = ?", [email, username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Username or Email already registered" });
    }

    // 1. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 2. Register in Cognito (optional - will bypass if cognito is not configured)
    let cognitoSub = null;
    try {
      cognitoSub = await cognitoRegister(username, email, password);
    } catch (cognitoError) {
      logger.warn("Cognito registration failed or bypassed, proceeding with local DB registration", { error: cognitoError.message });
    }

    // 3. Save User to RDS
    const [result] = await db.execute(
      "INSERT INTO users (username, email, password_hash, cognito_sub, phone, address) VALUES (?, ?, ?, ?, ?, ?)",
      [username, email, passwordHash, cognitoSub, phone || null, address || null]
    );

    const userId = result.insertId;

    // 4. Create empty shopping cart for the user
    await db.execute("INSERT INTO cart (user_id) VALUES (?)", [userId]);

    logger.info("New user registered successfully", { userId, username });

    // Generate local JWT token
    const token = generateLocalToken(userId);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        username,
        email,
        role: "customer",
        phone,
        address
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Try Cognito Authentication if enabled
    try {
      const cognitoAuth = await cognitoLogin(email, password); // Note: email can be username in Cognito
      if (cognitoAuth) {
        // Authenticated with Cognito!
        // Find or create user locally
        let [rows] = await db.execute("SELECT * FROM users WHERE email = ? OR username = ?", [email, email]);
        
        if (rows.length === 0) {
          // If user exists in Cognito but not local DB (e.g. cloud migrate), create local profile
          const [insertRes] = await db.execute(
            "INSERT INTO users (username, email, role, cognito_sub) VALUES (?, ?, 'customer', ?)",
            [email.split('@')[0], email, cognitoAuth.idToken]
          );
          
          await db.execute("INSERT INTO cart (user_id) VALUES (?)", [insertRes.insertId]);
          const [newUser] = await db.execute("SELECT * FROM users WHERE id = ?", [insertRes.insertId]);
          rows = newUser;
        }

        const user = rows[0];
        logger.info("Cognito Auth Login Successful", { userId: user.id });

        return res.json({
          message: "Login successful (via Cognito)",
          token: cognitoAuth.accessToken, // use access token for Cognito validation
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address
          }
        });
      }
    } catch (cognitoError) {
      logger.debug("Cognito Auth failed or not configured, using local DB verification:", { error: cognitoError.message });
    }

    // 2. Local DB Fallback Auth
    // Find user by email or username
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ? OR username = ?", [email, email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // Check password
    if (!user.password_hash) {
      return res.status(401).json({ message: "Please authenticate using your cloud provider account" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    logger.info("Local login successful", { userId: user.id });

    // Generate local JWT token
    const token = generateLocalToken(user.id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};
