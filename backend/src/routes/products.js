const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and admin role
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Create a product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, type, sku, image_url, description, quantity, price } = req.body;
    console.log('Received product data:', req.body); // Debug log
    const productData = {
      name,
      type,
      sku,
      image_url: image_url || '',
      description: description || '',
      quantity: parseInt(quantity, 10),
      price: parseFloat(price)
    };
    if (!name || !type || !sku || !Number.isInteger(productData.quantity) || isNaN(productData.price)) {
      return res.status(400).json({ error: 'Invalid input', details: 'Name, type, SKU, quantity, and price are required. Quantity must be an integer, price must be a number.' });
    }
    const product = new Product(productData);
    await product.save();
    res.status(201).json({ id: product._id, message: 'Product created', ...product.toObject() });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ error: 'Failed to create product', details: err.message });
  }
});

// Update a product (full update)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, type, sku, image_url, description, quantity, price } = req.body;
    const productData = {
      name,
      type,
      sku,
      image_url: image_url || '',
      description: description || '',
      quantity: parseInt(quantity, 10),
      price: parseFloat(price),
      updatedAt: new Date()
    };
    if (!name || !type || !sku || !Number.isInteger(productData.quantity) || isNaN(productData.price)) {
      return res.status(400).json({ error: 'Invalid input', details: 'Name, type, SKU, quantity, and price are required. Quantity must be an integer, price must be a number.' });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ id: product._id, message: 'Product updated', ...product.toObject() });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ error: 'Failed to update product', details: err.message });
  }
});

// Update product quantity
router.put('/:id/quantity', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const parsedQuantity = parseInt(quantity, 10);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity: parsedQuantity, updatedAt: new Date() },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ id: product._id, message: 'Quantity updated', ...product.toObject() });
  } catch (err) {
    console.error('Error updating quantity:', err);
    res.status(400).json({ error: 'Failed to update quantity', details: err.message });
  }
});

// Get all products with pagination and search
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.name ? { name: { $regex: req.query.name, $options: 'i' } } : {};
    console.log('Search query:', search); // Debug log
    const skip = (page - 1) * limit;

    const products = await Product.find(search)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Product.countDocuments(search);

    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete a product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get analytics (most added products, top expensive products, total value)
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const [mostAdded, topExpensive, totalValue] = await Promise.all([
      Product.aggregate([
        { $group: { _id: '$name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Product.find().sort({ price: -1 }).limit(5),
      Product.aggregate([
        { $group: { _id: null, totalValue: { $sum: { $multiply: ['$price', '$quantity'] } } } }
      ])
    ]);
    res.json({
      mostAdded,
      topExpensive,
      totalValue: totalValue[0]?.totalValue || 0
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;