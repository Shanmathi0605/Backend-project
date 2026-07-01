import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';
import Coupon from '../models/Coupon.js';
import sendEmail from '../utils/sendEmail.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public Coupon endpoint
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protect all vendor routes below
router.use(protect);
router.use(authorize('vendor', 'admin'));

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/:vendorId/dashboard
router.get('/:vendorId/dashboard', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendorUser = await User.findById(vendorId);
    if (!vendorUser) {
      return res.status(404).json({ message: 'Vendor store not found' });
    }

    const totalProducts = await Product.countDocuments({ vendorId });
    const orders = await Order.find({ 'items.product.vendorId': vendorId });

    const orderData = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.product.vendorId": vendorId } },
      {
        $group: {
          _id: { $substr: ["$date", 0, 7] },
          amount: { 
            $sum: { 
              $multiply: [
                { $subtract: ["$items.product.price", { $multiply: ["$items.product.price", { $divide: [{ $ifNull: ["$items.product.discount", 0] }, 100] }] }] },
                "$items.quantity"
              ] 
            } 
          }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    const recentSales = orderData.map(d => ({
      month: d._id,
      amount: Math.round(d.amount)
    }));

    res.json({
      totalProducts,
      totalSales: vendorUser.sales,
      walletBalance: vendorUser.walletBalance,
      totalOrders: orders.length,
      recentSales: recentSales.length > 0 ? recentSales : [
        { month: 'No Data', amount: 0 }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get vendor products
// @route   GET /api/vendor/:vendorId/products
router.get('/:vendorId/products', async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.params.vendorId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add a product
// @route   POST /api/vendor/:vendorId/products
router.post('/:vendorId/products', async (req, res) => {
  const { name, description, price, discount, category, brand, stock, images, specs } = req.body;
  try {
    const product = new Product({
      name,
      description,
      price: Number(price),
      discount: Number(discount || 0),
      category,
      brand: brand || 'Generic',
      stock: Number(stock),
      stockStatus: Number(stock) > 0 ? 'In Stock' : 'Out of Stock',
      images: images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'],
      specs: specs || {},
      vendorId: req.user._id,
      vendorName: req.user.storeName || req.user.name
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Edit a product
// @route   PUT /api/vendor/:vendorId/products/:id
router.put('/:vendorId/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      if (product.vendorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized listing modification' });
      }

      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
      product.discount = req.body.discount !== undefined ? Number(req.body.discount) : product.discount;
      product.category = req.body.category || product.category;
      product.brand = req.body.brand || product.brand;
      product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;
      product.stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
      if (req.body.images) product.images = req.body.images;
      if (req.body.specs) product.specs = req.body.specs;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/vendor/:vendorId/products/:id
router.delete('/:vendorId/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      if (product.vendorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized listing deletion' });
      }

      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get vendor orders
// @route   GET /api/vendor/:vendorId/orders
router.get('/:vendorId/orders', async (req, res) => {
  const { vendorId } = req.params;
  try {
    const orders = await Order.find({ 'items.product.vendorId': vendorId });
    const vendorOrders = orders.map((o) => {
      const filteredItems = o.items.filter((item) => item.product.vendorId === vendorId);
      const vendorTotal = filteredItems.reduce((sum, item) => {
        const price = item.product.price * (1 - (item.product.discount || 0) / 100);
        return sum + price * item.quantity;
      }, 0);

      return {
        _id: o._id,
        id: o.id,
        customerName: o.customerName,
        date: o.date,
        status: o.status,
        timeline: o.timeline,
        items: filteredItems,
        vendorTotal
      };
    });

    res.json(vendorOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order status timeline
// @route   PUT /api/vendor/:vendorId/orders/:orderId
router.put('/:vendorId/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (order) {
      order.status = status;
      order.timeline = order.timeline.map((step) => {
        if (step.status.toLowerCase() === status.toLowerCase()) {
          return { ...step, date: new Date().toLocaleString(), done: true };
        }
        return step;
      });
      await order.save();

      // Send status update email to customer
      try {
        let customerEmail = '';
        if (order.customerId && order.customerId !== 'guest') {
          const customer = await User.findById(order.customerId);
          if (customer) customerEmail = customer.email;
        } else if (order.shippingAddress && order.shippingAddress.email) {
          customerEmail = order.shippingAddress.email;
        }

        if (customerEmail) {
          await sendEmail({
            email: customerEmail,
            subject: `NovaCart Order Update - ${order._id}`,
            message: `Hello ${order.customerName},\n\nYour order status has been updated to: ${status}.\n\nThank you for shopping with NovaCart!`,
          });
        }
      } catch (err) {
        console.error('Failed to send status update email:', err);
      }

      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Request withdrawal
// @route   POST /api/vendor/:vendorId/withdraw
router.post('/:vendorId/withdraw', async (req, res) => {
  const { amount } = req.body;
  try {
    const vendorUser = await User.findById(req.user._id);
    if (vendorUser.walletBalance < Number(amount)) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    vendorUser.walletBalance -= Number(amount);
    await vendorUser.save();

    const withdrawal = await Withdrawal.create({
      vendorId: req.user._id,
      vendorName: req.user.storeName || req.user.name,
      amount: Number(amount),
      status: 'Pending'
    });

    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get withdrawals list
// @route   GET /api/vendor/:vendorId/withdrawals
router.get('/:vendorId/withdrawals', async (req, res) => {
  try {
    const list = await Withdrawal.find({ vendorId: req.params.vendorId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create promo coupons
// @route   POST /api/vendor/coupons
router.post('/coupons', async (req, res) => {
  const { code, discount, type, expiry } = req.body;
  try {
    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code,
      discount: Number(discount),
      type,
      expiry
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
