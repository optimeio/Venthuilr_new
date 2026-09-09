import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  productCode: {
    type: String,
    unique: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  hsnSac: { type: String, default: "" },
  slug: { type: String, unique: true },
  imageUrl: { type: String },
  images: { type: [String], default: [] },
  category: { type: String, default: "General" },
  badge: { type: String, default: "" },
  shippingCharge: { type: Number, default: 0 },
  originalPrice: { type: Number },
  discountPercent: { type: Number },
  variants: [{
    label:    { type: String, required: true },
    price:    { type: Number, required: true },
    contents: { type: String, default: '' }
  }],
  comboContents: [{
    item:   { type: String, required: true },
    weight: { type: String, required: true }
  }],
  initialStock: { type: Number, default: 0, min: 0 },
  currentStock: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProductSchema.pre('save', async function () {
  this.updatedAt = new Date();

  if (!this.productCode) {
    const randomPart = Math.floor(100000 + Math.random() * 900000);
    this.productCode = `VNT-${randomPart}`;
  }

  if (this.isModified('name') || !this.slug) {
    let baseSlug = (this.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const suffix = (this.productCode || '').replace('VNT-', '').toLowerCase();
    this.slug = `${baseSlug}-${suffix}`;
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema, 'ProductDetails');
export default Product;
