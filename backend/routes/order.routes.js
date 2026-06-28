const express = require("express");
const router = express.Router();
const { placeOrder, getOrders, getOrderById } = require("../controllers/order.controller");
const { protect } = require("../middleware/auth");
const { validateOrder } = require("../middleware/validator");

// All order operations require login protection
router.use(protect);

router.post("/", validateOrder, placeOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);

module.exports = router;
