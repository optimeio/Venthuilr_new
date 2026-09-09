import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  message: { type: String, required: true },
  reply: { type: String },
  status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema, 'MessageHistory');
export default Message;
