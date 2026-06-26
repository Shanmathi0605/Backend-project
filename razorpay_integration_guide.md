# Razorpay Payment Gateway Integration Guide

This guide provides step-by-step instructions to integrate the Razorpay payment gateway into your React frontend and Node.js/Express backend application.

---

## 1. Razorpay Account Setup
1. Sign up for a developer account at [Razorpay](https://razorpay.com/).
2. Switch to **Test Mode** in your dashboard.
3. Navigate to **Account & Settings** > **API Keys**.
4. Click **Generate Key** to obtain your:
   - `Key ID`
   - `Key Secret`
5. Save these credentials securely.

---

## 2. Backend Setup (Node.js/Express)

### Step A: Install Dependencies
Install the official Razorpay SDK on your server:
```bash
npm install razorpay
```

### Step B: Environment Variables
Add your Razorpay keys to your server `.env` file:
```env
RAZORPAY_KEY_ID=rzp_test_yourKeyId Here
RAZORPAY_KEY_SECRET=yourKeySecretHere
```

### Step C: Create Payment Controller / Routes
Create a new route file at `server/routes/paymentRoutes.js` to manage order creation and verification:

```javascript
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create a Razorpay Order
// @route   POST /api/payment/razorpay-order
router.post('/razorpay-order', protect, async (req, res) => {
  const { amount } = req.body; // Amount in rupees/dollars
  try {
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json({
      id: order.id,
      currency: order.currency,
      amount: order.amount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/verify
router.post('/verify', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = req.body;
  try {
    // Generate signature using HMAC-SHA256 and Key Secret
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    // Compare signatures
    if (razorpay_signature === expectedSign) {
      // Payment verified, update database order
      const order = await Order.findById(db_order_id);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentDetails = {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id
        };
        await order.save();
        return res.status(200).json({ message: 'Payment verified successfully' });
      } else {
        return res.status(404).json({ message: 'Order not found' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid signature. Payment verification failed.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
```

---

## 3. Frontend Setup (React)

### Step A: Load Razorpay Script
Add the Razorpay Checkout script to the `<head>` or `<body>` of your `index.html` file:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Step B: Implement Checkout Trigger
In your frontend checkout or payment component (e.g. `CustomerPayment` or `CustomerCheckout`), integrate the payment trigger function:

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

export const CheckoutPayment = ({ orderData, totalAmount }) => {
  const { addToast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('app_token');
      
      // 1. Create a local order in your database first
      const dbOrderRes = await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dbOrderId = dbOrderRes.data._id;

      // 2. Request a Razorpay order from the backend
      const razorpayOrderRes = await axios.post('/api/payment/razorpay-order', 
        { amount: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { id: razorpayOrderId, amount: razorpayAmount, currency } = razorpayOrderRes.data;

      // 3. Configure Razorpay Checkout options
      const options = {
        key: 'rzp_test_yourKeyIdHere', // Replace with your actual frontend Key ID
        amount: razorpayAmount,
        currency: currency,
        name: 'NovaCart Multi-Vendor',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            // 4. Send payment details to backend for verification
            const verifyRes = await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              db_order_id: dbOrderId
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            addToast('Payment completed successfully!', 'success');
            // Navigate to order success page
          } catch (error) {
            addToast('Payment verification failed', 'error');
          }
        },
        prefill: {
          name: 'John Doe',
          email: 'customer@test.com',
          contact: '9999999999'
        },
        theme: {
          color: '#2563EB' // Theme primary color
        }
      };

      // 5. Open Razorpay payment gateway modal
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      addToast(error.response?.data?.message || 'Error initializing payment', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={processing}>
      {processing ? 'Processing Payment...' : 'Pay with Razorpay'}
    </button>
  );
};
```
