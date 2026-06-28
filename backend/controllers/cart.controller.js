const db = require("../config/db");
const logger = require("../utils/logger");

/**
 * Helper to get or create cart for user
 */
const getOrCreateCartId = async (userId) => {
  const [carts] = await db.execute("SELECT id FROM cart WHERE user_id = ?", [userId]);
  if (carts.length > 0) {
    return carts[0].id;
  }
  const [result] = await db.execute("INSERT INTO cart (user_id) VALUES (?)", [userId]);
  return result.insertId;
};

/**
 * Get Cart Items
 * GET /api/cart
 */
const getCart = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const cartId = await getOrCreateCartId(userId);

    const [items] = await db.execute(`
      SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);

    res.json({ cartId, items });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Item to Cart
 * POST /api/cart
 */
const addToCart = async (req, res, next) => {
  const userId = req.user.id;
  const { product_id, quantity = 1 } = req.body;

  try {
    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if product exists and check stock
    const [products] = await db.execute("SELECT name, stock, price FROM products WHERE id = ?", [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = products[0];
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items left.` });
    }

    const cartId = await getOrCreateCartId(userId);

    // Check if item already in cart
    const [existing] = await db.execute(
      "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, product_id]
    );

    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + Number(quantity);
      if (product.stock < newQuantity) {
        return res.status(400).json({ message: `Cannot add more. Insufficient stock.` });
      }
      
      await db.execute(
        "UPDATE cart_items SET quantity = ? WHERE id = ?",
        [newQuantity, existing[0].id]
      );
    } else {
      await db.execute(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
        [cartId, product_id, Number(quantity)]
      );
    }

    logger.info("Product added/updated in cart", { userId, productId: product_id, quantity });

    // Return the updated cart items
    const [updatedItems] = await db.execute(`
      SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);

    res.json({ message: "Item added to cart", items: updatedItems });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Cart Item Quantity
 * PUT /api/cart/:id
 */
const updateCartItem = async (req, res, next) => {
  const { id } = req.params; // cart_items.id
  const { quantity } = req.body;
  const userId = req.user.id;

  try {
    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    // Verify this cart item belongs to the logged in user
    const [cartItem] = await db.execute(`
      SELECT ci.*, c.user_id, p.stock, p.name
      FROM cart_items ci
      JOIN cart c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND c.user_id = ?
    `, [id, userId]);

    if (cartItem.length === 0) {
      return res.status(404).json({ message: "Cart item not found or unauthorized" });
    }

    if (cartItem[0].stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Only ${cartItem[0].stock} items left.` });
    }

    await db.execute("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, id]);

    logger.info("Cart item quantity updated", { cartItemId: id, userId, quantity });

    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove Item from Cart
 * DELETE /api/cart/:id
 */
const deleteCartItem = async (req, res, next) => {
  const { id } = req.params; // cart_items.id
  const userId = req.user.id;

  try {
    // Verify ownership
    const [cartItem] = await db.execute(`
      SELECT ci.id, c.id as cart_id
      FROM cart_items ci
      JOIN cart c ON ci.cart_id = c.id
      WHERE ci.id = ? AND c.user_id = ?
    `, [id, userId]);

    if (cartItem.length === 0) {
      return res.status(404).json({ message: "Cart item not found or unauthorized" });
    }

    await db.execute("DELETE FROM cart_items WHERE id = ?", [id]);

    logger.info("Cart item removed", { cartItemId: id, userId });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem
};
