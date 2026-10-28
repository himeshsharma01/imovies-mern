import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  seats: [String],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['confirmed','cancelled'], default: 'confirmed' },
  paymentStatus: { type: String, enum: ['demo-paid','refunded','not-applicable'], default: 'demo-paid' }
}, { timestamps: true });
export default mongoose.model('Booking', schema);
