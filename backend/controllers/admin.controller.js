const db = require("../config/db");
const logger = require("../utils/logger");

/**
 * Get dashboard stats
 * GET /api/admin/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Sales
    const [salesRows] = await db.execute("SELECT SUM(total_amount) as totalSales FROM orders WHERE status != 'cancelled'");
    const totalSales = salesRows[0].totalSales || 0;

    // 2. Total Orders
    const [orderRows] = await db.execute("SELECT COUNT(*) as totalOrders FROM orders");
    const totalOrders = orderRows[0].totalOrders || 0;

    // 3. Total Products
    const [productRows] = await db.execute("SELECT COUNT(*) as totalProducts FROM products");
    const totalProducts = productRows[0].totalProducts || 0;

    // 4. Total Users
    const [userRows] = await db.execute("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'customer'");
    const totalUsers = userRows[0].totalUsers || 0;

    // 5. Recent Orders
    const [recentOrders] = await db.execute(`
      SELECT o.*, u.username, u.email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC 
      LIMIT 5
    `);

    // 6. Category sales breakdown
    const [categorySales] = await db.execute(`
      SELECT c.name as category, SUM(oi.quantity * oi.price) as sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY c.name
    `);

    res.json({
      stats: {
        totalSales: Number(totalSales),
        totalOrders,
        totalProducts,
        totalUsers
      },
      recentOrders,
      categorySales
    });
  } catch (error) {
    next(error);
  }
};

/**
 * View all users (Admin Only)
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const [users] = await db.execute("SELECT id, username, email, role, phone, address, created_at FROM users ORDER BY created_at DESC");
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

/**
 * View all orders (Admin Only)
 * GET /api/admin/orders
 */
const getOrders = async (req, res, next) => {
  try {
    const [orders] = await db.execute(`
      SELECT o.*, u.username, u.email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (Admin Only)
 * PUT /api/admin/orders/:id
 */
const updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    // Check if order exists
    const [existing] = await db.execute("SELECT * FROM orders WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update status
    await db.execute("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

    logger.info("Order status updated by admin", { orderId: id, newStatus: status });

    res.json({ message: `Order status updated to ${status} successfully` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getOrders,
  updateOrderStatus
};
