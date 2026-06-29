import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all brands
// @route   GET /api/products/brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find({});
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get filtered products catalog
// @route   GET /api/products
router.get('/', async (req, res) => {
  try {
    const { search, category, brand, rating, minPrice, maxPrice, availability, sort } = req.query;
    
    let query = { isApproved: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = { $regex: new RegExp('^' + category + '$', 'i') };
    }

    if (brand) {
      query.brand = { $regex: new RegExp('^' + brand + '$', 'i') };
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Handled with discount factor computations
    if (minPrice || maxPrice) {
      // Direct query for simplicity: in production, pricing ranges are calculated with discounts
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (availability === 'in-stock') {
      query.stock = { $gt: 0 };
    } else if (availability === 'out-of-stock') {
      query.stock = 0;
    }

    let products = await Product.find(query);

    // Sorting
    if (sort) {
      if (sort === 'price-low') {
        products.sort((a, b) => {
          const pa = a.price * (1 - (a.discount || 0) / 100);
          const pb = b.price * (1 - (b.discount || 0) / 100);
          return pa - pb;
        });
      } else if (sort === 'price-high') {
        products.sort((a, b) => {
          const pa = a.price * (1 - (a.discount || 0) / 100);
          const pb = b.price * (1 - (b.discount || 0) / 100);
          return pb - pa;
        });
      } else if (sort === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'newest') {
        products.sort((a, b) => b.createdAt - a.createdAt);
      }
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single product details
// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    // Validate that id is a valid MongoDB ObjectId before querying
    const { isValidObjectId } = await import('mongoose');
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add review comment
// @route   POST /api/products/:id/reviews
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment, user } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const review = {
        user: user || req.user.name,
        rating: Number(rating),
        comment,
        date: new Date().toISOString().split('T')[0]
      };

      product.reviews.push(review);
      product.reviewsCount = product.reviews.length;
      
      const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
      product.rating = parseFloat((sum / product.reviews.length).toFixed(1));

      await product.save();
      res.status(201).json(review);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
