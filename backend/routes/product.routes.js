const express = require("express");
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require("../controllers/product.controller");
const { protect, admin } = require("../middleware/auth");
const upload = require("../middleware/multer");
const { validateProduct } = require("../middleware/validator");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only routes
router.post("/", protect, admin, upload.single("image"), validateProduct, createProduct);
router.put("/:id", protect, admin, upload.single("image"), validateProduct, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
