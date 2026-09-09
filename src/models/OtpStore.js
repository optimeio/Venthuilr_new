import mongoose from 'mongoose';

const otpStoreSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otpHash: { type: String },
  type: { type: String, enum: ['register', 'login', 'reset'], required: true },
  verified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
});

otpStoreSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpStore = mongoose.models.OtpStore || mongoose.model('OtpStore', otpStoreSchema);
export default OtpStore;
