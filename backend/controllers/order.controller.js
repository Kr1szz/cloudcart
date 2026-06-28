const db = require("../config/db");
const { generateInvoice } = require("../services/lambda.service");
const { sendOrderConfirmationEmail } = require("../services/ses.service");
const { sendSMSOrderNotification } = require("../services/sns.service");
const logger = require("../utils/logger");

/**
 * Place a new order
 * POST /api/orders
 */
const placeOrder = async (req, res, next) => {
  const userId = req.user.id;
  const { shipping_address, payment_method } = req.body;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // 1. Get user's cart items
    const [cartRows] = await conn.execute("SELECT id FROM cart WHERE user_id = ?", [userId]);
    if (cartRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: "No active cart found" });
    }

    const cartId = cartRows[0].id;
    const [cartItems] = await conn.execute(`
      SELECT ci.quantity, p.id as product_id, p.name, p.price, p.stock 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);

    if (cartItems.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: "Your shopping cart is empty" });
    }

    // 2. Validate stock for each item & calculate total
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
      }
      totalAmount += Number(item.price) * item.quantity;
    }

    // 3. Create Order record
    const [orderResult] = await conn.execute(
      "INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_status) VALUES (?, ?, 'processing', ?, 'paid')",
      [userId, totalAmount, shipping_address]
    );

    const orderId = orderResult.insertId;

    // 4. Create Order Items & Deduct Stock
    for (const item of cartItems) {
      // Create order item
      await conn.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Deduct stock
      await conn.execute(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    // 5. Create Payment record (mock payment success)
    const transactionId = `TXN_${Date.now()}_${orderId}`;
    await conn.execute(
      "INSERT INTO payments (order_id, payment_method, transaction_id, status, amount) VALUES (?, ?, ?, 'success', ?)",
      [orderId, payment_method, transactionId, totalAmount]
    );

    // 6. Clear Cart Items
    await conn.execute("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

    // Commit transaction
    await conn.commit();
    conn.release();

    logger.info("Order transaction committed successfully", { orderId, userId, totalAmount });

    // Fetch the newly created order for response and AWS triggers
    const [orders] = await db.execute("SELECT * FROM orders WHERE id = ?", [orderId]);
    const order = orders[0];

    // Trigger Asynchronous Operations (Invoice, SES, SNS)
    // Runs in background or async to avoid blocking response
    setImmediate(async () => {
      try {
        // Fetch user phone & details
        const [users] = await db.execute("SELECT id, username, email, phone FROM users WHERE id = ?", [userId]);
        const user = users[0];

        // 1. Invoke Lambda function to generate Invoice and get URL
        const invoiceUrl = await generateInvoice(order, cartItems, user);
        
        // 2. Save Invoice URL to order
        await db.execute("UPDATE orders SET invoice_url = ? WHERE id = ?", [invoiceUrl, orderId]);
        order.invoice_url = invoiceUrl;

        // 3. Send Order Confirmation Email via SES
        await sendOrderConfirmationEmail(user.email, order, cartItems);

        // 4. Send Order SMS via SNS
        if (user.phone) {
          await sendSMSOrderNotification(user.phone, orderId, totalAmount);
        }
      } catch (bgError) {
        logger.error("Error processing order notifications/invoice in background", { error: bgError.message, orderId });
      }
    });

    res.status(201).json({
      message: "Order placed successfully",
      orderId,
      order
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    next(error);
  }
};

/**
 * Get logged-in user's order history
 * GET /api/orders
 */
const getOrders = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const [orders] = await db.execute(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order details
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // If admin, they can view any order; if customer, only their own
    let query = "SELECT * FROM orders WHERE id = ?";
    let params = [id];

    if (userRole !== "admin") {
      query += " AND user_id = ?";
      params.push(userId);
    }

    const [orders] = await db.execute(query, params);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];

    // Get order items details
    const [items] = await db.execute(`
      SELECT oi.id, oi.quantity, oi.price, p.id as product_id, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    res.json({ order, items });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderById
};
