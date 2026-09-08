const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    couponCode: { type: String, required: true, unique: true, uppercase: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // if null, applies to cart
    maxUses: { type: Number, required: true, default: 25 },
    usedCount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Coupon', CouponSchema, 'Coupons');
