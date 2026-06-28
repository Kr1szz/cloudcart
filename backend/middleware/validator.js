const { body, validationResult } = require("express-validator");

/**
 * Common handler to return validation errors if any
 */
const checkErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateRegister = [
  body("username").trim().notEmpty().withMessage("Username is required").isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  body("email").isEmail().withMessage("Provide a valid email address").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  checkErrors
];

const validateLogin = [
  body("email").trim().notEmpty().withMessage("Email or username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  checkErrors
];

const validateProduct = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("description").trim().notEmpty().withMessage("Product description is required"),
  body("price").isFloat({ min: 0.01 }).withMessage("Price must be a positive number"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("category_id").isInt().withMessage("Category ID must be an integer"),
  checkErrors
];

const validateOrder = [
  body("shipping_address").trim().notEmpty().withMessage("Shipping address is required"),
  body("payment_method").trim().notEmpty().withMessage("Payment method is required"),
  checkErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateOrder
};
