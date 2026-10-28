import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true },
  startsAt: { type: Date, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  seats: [{
    seatNumber: { type: String, required: true },
    status: { type: String, enum: ['available','booked'], default: 'available' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null }
  }]
}, { timestamps: true });
schema.index({ theatre: 1, startsAt: 1 });
export default mongoose.model('Show', schema);
