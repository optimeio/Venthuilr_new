import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  phone: { type: String, required: true },
  deliveryAddress: { type: Object, required: true },
  items: { type: Array, default: [] },
  originalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  couponUsed: { type: String, default: null },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  status: { type: String, default: 'Pending' },
  statusUpdatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema, 'OrderRegistry');
export default Order;
