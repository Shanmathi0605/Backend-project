import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import SupportTicket from '../models/SupportTicket.js';
import sendEmail from '../utils/sendEmail.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Place a new order
// @route   POST /api/orders
router.post('/', async (req, res) => {
  const { customerId, customerName, total, paymentMethod, shippingAddress, items } = req.body;
  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items ordered' });
    }

    const order = new Order({
      customerId: customerId || 'guest',
      customerName: customerName || 'Guest',
      total,
      paymentMethod,
      shippingAddress,
      items,
      timeline: [
        { status: 'Ordered', date: new Date().toLocaleString(), done: true },
        { status: 'Processed', date: new Date().toLocaleString(), done: true },
        { status: 'Shipped', date: '', done: false },
        { status: 'Delivered', date: '', done: false }
      ]
    });

    const createdOrder = await order.save();

    // Decrement inventory stock count for items bought
    for (const item of items) {
      const dbProduct = await Product.findById(item.product.id);
      if (dbProduct) {
        dbProduct.stock = Math.max(0, dbProduct.stock - item.quantity);
        dbProduct.stockStatus = dbProduct.stock === 0 ? 'Out of Stock' : 'In Stock';
        await dbProduct.save();
      }

      // Split earnings to vendor wallet
      const vendorUser = await User.findById(item.product.vendorId);
      if (vendorUser) {
        const itemPrice = item.product.price * (1 - (item.product.discount || 0) / 100) * item.quantity;
        const commission = (itemPrice * (vendorUser.commissionRate || 10)) / 100;
        const vendorEarning = itemPrice - commission;

        vendorUser.sales += itemPrice;
        vendorUser.walletBalance += vendorEarning;
        await vendorUser.save();

        // Send vendor notification
        try {
          const vendorMessage = `
Hello ${vendorUser.name},

You have a new order for your product!
Product: ${item.product.name}
Quantity: ${item.quantity}
Earnings for this item: $${vendorEarning.toFixed(2)}

Please check your vendor dashboard for more details.
          `;
          await sendEmail({
            email: vendorUser.email,
            subject: `New Order Received - ${createdOrder._id}`,
            message: vendorMessage,
          });
        } catch (err) {
          console.error('Failed to send vendor notification email:', err);
        }
      }
    }

    // Send order success email
    try {
      let customerEmail = '';
      if (customerId && customerId !== 'guest') {
        const user = await User.findById(customerId);
        if (user) customerEmail = user.email;
      } else if (shippingAddress && shippingAddress.email) {
        customerEmail = shippingAddress.email;
      }

      if (customerEmail) {
        const message = `
Hello ${customerName},

Your order has been successfully placed!
Order ID: ${createdOrder._id}
Total Amount: $${total.toFixed(2)}
Status: Ordered

Thank you for shopping with NovaCart!
        `;
        await sendEmail({
          email: customerEmail,
          subject: `NovaCart Order Confirmation - ${createdOrder._id}`,
          message,
        });
      }
    } catch (err) {
      console.error('Failed to send order confirmation email:', err);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get customer orders
// @route   GET /api/orders
router.get('/', protect, async (req, res) => {
  try {
    const { customerId } = req.query;
    let query = {};
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (customerId) {
      query.customerId = customerId;
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      // Access check
      if (req.user.role === 'customer' && order.customerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied to this order history' });
      }
      res.json(order);
    } else {
      // Also fallback search in case user searches by string ID
      const orderSearch = await Order.findOne({ id: req.params.id });
      if (orderSearch) return res.json(orderSearch);
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Track order
// @route   GET /api/orders/track/:id
router.get('/track/:id', async (req, res) => {
  try {
    // Allows public tracking checks by custom Order ID
    const order = await Order.findOne({ id: req.params.id });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order tracking ID not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Submit support ticket
// @route   POST /api/orders/support/tickets
router.post('/support/tickets', async (req, res) => {
  const { customerName, subject, priority, message } = req.body;
  try {
    const ticket = await SupportTicket.create({
      customerName,
      subject,
      priority,
      message
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
