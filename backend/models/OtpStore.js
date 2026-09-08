const mongoose = require('mongoose');

// Stores OTPs in MongoDB so they survive Render free-tier restarts
const otpStoreSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true },
    otpHash: { type: String },
    type: { type: String, enum: ['register', 'login', 'reset'], required: true },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
});

// Auto-delete expired OTPs from DB
otpStoreSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpStore', otpStoreSchema);
