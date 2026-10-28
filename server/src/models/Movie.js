import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  posterUrl: { type: String, default: '' },
  durationMinutes: { type: Number, min: 1, required: true },
  genres: [String], language: { type: String, default: 'Hindi' },
  releaseDate: Date, rating: { type: Number, min: 0, max: 10, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });
schema.index(
  { title: 'text', description: 'text', genres: 'text' },
  { default_language: 'none', language_override: 'none' }
);
export default mongoose.model('Movie', schema);
