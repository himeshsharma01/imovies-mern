import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true, index: true },
  address: { type: String, required: true },
  totalSeats: { type: Number, min: 1, default: 60 }
}, { timestamps: true });
export default mongoose.model('Theatre', schema);
