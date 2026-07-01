import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Withdrawal from '../models/Withdrawal.js';
import SupportTicket from '../models/SupportTicket.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// @desc    Get admin dashboard metrics
// @route   GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalProducts = await Product.countDocuments({});
    const orders = await Order.find({});
    const openTicketsCount = await SupportTicket.countDocuments({ status: 'Open' });

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const commissionEarned = totalSales * 0.10; // Assume 10% average platform commission fees

    const orderData = await Order.aggregate([
      {
        $group: {
          _id: { $substr: ["$date", 0, 7] },
          sales: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    const monthlyAnalytics = orderData.map(d => ({
      month: d._id, // e.g. "2023-10"
      sales: d.sales,
      revenue: d.sales * 0.10
    }));

    res.json({
      totalVendors,
      totalProducts,
      totalSales,
      commissionEarned,
      openTickets: openTicketsCount,
      monthlyAnalytics: monthlyAnalytics.length > 0 ? monthlyAnalytics : [
        { month: 'No Data', sales: 0, revenue: 0 }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all vendors
// @route   GET /api/admin/vendors
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update vendor status (Approved/Suspended/etc)
// @route   PUT /api/admin/vendors/:vendorId/status
router.put('/vendors/:vendorId/status', async (req, res) => {
  const { status } = req.body;
  try {
    const vendor = await User.findById(req.params.vendorId);
    if (vendor) {
      vendor.status = status;
      await vendor.save();
      res.json(vendor);
    } else {
      res.status(404).json({ message: 'Vendor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all products (including unapproved)
// @route   GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update product approval status
// @route   PUT /api/admin/products/:id/status
router.put('/products/:id/status', async (req, res) => {
  const { isApproved } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isApproved = isApproved;
      await product.save();
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get withdrawals queue
// @route   GET /api/admin/withdrawals
router.get('/withdrawals', async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({}).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve or reject withdrawal request
// @route   PUT /api/admin/withdrawals/:id
router.put('/withdrawals/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const request = await Withdrawal.findById(req.params.id);
    if (request) {
      request.status = status;
      await request.save();

      // If rejected, refund balance to vendor wallet
      if (status === 'Rejected') {
        const vendor = await User.findById(request.vendorId);
        if (vendor) {
          vendor.walletBalance += request.amount;
          await vendor.save();
        }
      }

      res.json(request);
    } else {
      res.status(404).json({ message: 'Withdrawal request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get support tickets
// @route   GET /api/admin/tickets
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await SupportTicket.find({}).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update support ticket status (Resolved/Closed)
// @route   PUT /api/admin/tickets/:id
router.put('/tickets/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (ticket) {
      ticket.status = status;
      await ticket.save();
      res.json(ticket);
    } else {
      res.status(404).json({ message: 'Support ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add category to catalog
// @route   POST /api/admin/categories
router.post('/categories', async (req, res) => {
  const { name, image } = req.body;
  try {
    const category = await Category.create({
      name,
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop'
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add brand to catalog
// @route   POST /api/admin/brands
router.post('/brands', async (req, res) => {
  const { name, image } = req.body;
  try {
    const brand = await Brand.create({
      name,
      image: image || 'https://images.unsplash.com/photo-1612810806563-4cb1a99a2037?q=80&w=200&auto=format&fit=crop'
    });
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
