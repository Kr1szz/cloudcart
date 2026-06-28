const db = require("../config/db");
const { uploadImage, deleteImage } = require("../services/s3.service");
const logger = require("../utils/logger");

/**
 * Get all products with search, pagination, and filter parameters
 * GET /api/products
 */
const getProducts = async (req, res, next) => {
  const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  try {
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += " AND c.name = ?";
      params.push(category);
    }

    if (minPrice) {
      query += " AND p.price >= ?";
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += " AND p.price <= ?";
      params.push(Number(maxPrice));
    }

    if (sort) {
      if (sort === "price_asc") {
        query += " ORDER BY p.price ASC";
      } else if (sort === "price_desc") {
        query += " ORDER BY p.price DESC";
      } else if (sort === "newest") {
        query += " ORDER BY p.created_at DESC";
      }
    } else {
      query += " ORDER BY p.id DESC";
    }

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += " LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [products] = await db.query(query, params);

    // Fetch count for total pagination pages
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const countParams = [];
    if (search) {
      countQuery += " AND (p.name LIKE ? OR p.description LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      countQuery += " AND c.name = ?";
      countParams.push(category);
    }
    if (minPrice) {
      countQuery += " AND p.price >= ?";
      countParams.push(Number(minPrice));
    }
    if (maxPrice) {
      countQuery += " AND p.price <= ?";
      countParams.push(Number(maxPrice));
    }
    
    const [countRows] = await db.execute(countQuery, countParams);
    const total = countRows[0].total;

    // Fetch categories for filtering list
    const [categories] = await db.execute("SELECT * FROM categories ORDER BY name ASC");

    res.json({
      products,
      categories,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product details by ID
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = rows[0];

    // Fetch reviews for this product
    const [reviews] = await db.execute(`
      SELECT r.*, u.username 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    res.json({ product, reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new product (Admin Only)
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  const { name, description, price, stock, category_id } = req.body;
  let imageUrl = null;

  try {
    // 1. Upload file if uploaded
    if (req.file) {
      const fileName = `${Date.now()}_${req.file.originalname}`;
      imageUrl = await uploadImage(req.file.buffer, fileName, req.file.mimetype);
      
      // If S3 fails & uploads locally, multer buffer will be written by s3.service to /uploads/
      if (imageUrl.startsWith('/uploads/')) {
        const fs = require("fs");
        const path = require("path");
        const uploadsDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, imageUrl.replace('/uploads/', '')), req.file.buffer);
      }
    }

    // 2. Save product to RDS
    const [result] = await db.execute(
      "INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, Number(price), Number(stock), Number(category_id), imageUrl]
    );

    logger.info("Product created successfully", { productId: result.insertId, name });

    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertId,
      product: {
        id: result.insertId,
        name,
        description,
        price,
        stock,
        category_id,
        image_url: imageUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (Admin Only)
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, stock, category_id } = req.body;

  try {
    // Check if product exists
    const [existing] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imageUrl = existing[0].image_url;

    // 1. Upload new file if present
    if (req.file) {
      // Delete old image if it exists in S3
      if (imageUrl) {
        await deleteImage(imageUrl);
      }
      
      const fileName = `${Date.now()}_${req.file.originalname}`;
      imageUrl = await uploadImage(req.file.buffer, fileName, req.file.mimetype);
      
      // Write locally if fallback
      if (imageUrl.startsWith('/uploads/')) {
        const fs = require("fs");
        const path = require("path");
        const uploadsDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, imageUrl.replace('/uploads/', '')), req.file.buffer);
      }
    }

    // 2. Update DB
    await db.execute(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image_url = ? 
       WHERE id = ?`,
      [name, description, Number(price), Number(stock), Number(category_id), imageUrl, id]
    );

    logger.info("Product updated successfully", { productId: id, name });

    res.json({
      message: "Product updated successfully",
      product: {
        id,
        name,
        description,
        price,
        stock,
        category_id,
        image_url: imageUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (Admin Only)
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Check product and get image URL
    const [existing] = await db.execute("SELECT image_url FROM products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imageUrl = existing[0].image_url;

    // 1. Delete image
    if (imageUrl) {
      await deleteImage(imageUrl);
      if (imageUrl.startsWith('/uploads/')) {
        const fs = require("fs");
        const path = require("path");
        const localPath = path.join(__dirname, "../", imageUrl);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      }
    }

    // 2. Delete product from DB
    await db.execute("DELETE FROM products WHERE id = ?", [id]);

    logger.info("Product deleted successfully", { productId: id });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
