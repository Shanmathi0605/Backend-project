import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  category: { type: String, required: true },
  brand: { type: String, default: 'Generic' },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  stockStatus: { type: String, enum: ['In Stock', 'Out of Stock'], default: 'In Stock' },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  specs: { type: Map, of: String, default: {} },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorName: { type: String, required: true },
  isApproved: { type: Boolean, default: true },
  reviews: [reviewSchema]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
