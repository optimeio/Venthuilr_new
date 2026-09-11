import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  deliveryAddress: {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: 'Tamil Nadu' },
    zipCode: { type: String, default: '' }
  },
  isEmailVerified: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.models.User || mongoose.model('User', UserSchema, 'CustomerDetails');
export default User;
