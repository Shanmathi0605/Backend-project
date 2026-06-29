import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

// @desc    Create a Razorpay Order
// @route   POST /api/payment/razorpay-order
router.post('/razorpay-order', async (req, res) => {
  const { amount } = req.body;
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ message: 'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env' });
    }

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await rzp.orders.create(options);
    res.status(201).json({
      id: order.id,
      currency: order.currency,
      amount: order.amount
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Razorpay order creation failed' });
  }
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/verify
router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    
    // Generate expected signature using HMAC-SHA256
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', keySecret)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      res.status(200).json({ success: true, message: 'Payment signature verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature. Payment verification failed.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
