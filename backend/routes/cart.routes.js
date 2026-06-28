const express = require("express");
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  deleteCartItem 
} = require("../controllers/cart.controller");
const { protect } = require("../middleware/auth");

// All cart operations require login protection
router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:id", updateCartItem);
router.delete("/:id", deleteCartItem);

module.exports = router;
