const express = require("express");
const router = express.Router();
const { 
  getDashboardStats, 
  getUsers, 
  getOrders, 
  updateOrderStatus 
} = require("../controllers/admin.controller");
const { protect, admin } = require("../middleware/auth");

// All admin operations require both authentication and the admin role
router.use(protect, admin);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/orders", getOrders);
router.put("/orders/:id", updateOrderStatus);

module.exports = router;
