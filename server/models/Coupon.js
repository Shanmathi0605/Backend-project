import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discount: { type: Number, required: true },
  type: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
  expiry: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
