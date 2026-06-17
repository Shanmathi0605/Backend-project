import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    images: [{ type: String }],
    vendorId: { type: String, required: true }
  },
  quantity: { type: Number, required: true, default: 1 }
});

const timelineStepSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: String, default: '' },
  done: { type: Boolean, default: false }
});

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Processing', 'Shipped', 'Delivered'], default: 'Processing' },
  paymentMethod: { type: String, required: true },
  shippingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String }
  },
  items: [orderItemSchema],
  timeline: [timelineStepSchema],
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
