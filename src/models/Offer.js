import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  images: { type: [String], default: [] },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  mrpIllusion: { type: Number, default: null },
  discountPercent: { type: Number, default: null },
  category: { type: String, default: 'General' },
  badge: { type: String, default: 'Limited Offer' },
  stock: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  condition: { type: String, default: 'First 60 customers only allowed' },
  comboContents: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

OfferSchema.pre('save', function () {
  this.updatedAt = new Date();
});

OfferSchema.virtual('status').get(function () {
  const now = new Date();
  if (!this.isActive) return 'Inactive';
  if (this.stock <= 0) return 'Stock Over';
  if (now < new Date(this.startDate)) return 'Upcoming';
  if (now > new Date(this.endDate)) return 'Expired';
  return 'Active';
});

OfferSchema.set('toJSON', { virtuals: true });
OfferSchema.set('toObject', { virtuals: true });

const Offer = mongoose.models.Offer || mongoose.model('Offer', OfferSchema, 'OffersCollection');
export default Offer;
