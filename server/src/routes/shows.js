import { Router } from 'express';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Booking from '../models/Booking.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.movie) filter.movie = req.query.movie;
    if (req.query.theatre) filter.theatre = req.query.theatre;

    if (req.query.upcoming === 'true') {
      filter.startsAt = { $gte: new Date() };
    }

    if (req.query.from || req.query.to) {
      filter.startsAt = filter.startsAt || {};
      if (req.query.from) filter.startsAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.startsAt.$lte = new Date(req.query.to);
    }

    const shows = await Show.find(filter)
      .populate('movie', 'title posterUrl durationMinutes language rating genres')
      .populate('theatre', 'name city address')
      .sort({ startsAt: 1 });

    // Include seat statistics for admin or listings
    const formatted = shows.map(s => {
      const doc = s.toObject();
      const bookedCount = doc.seats ? doc.seats.filter(seat => seat.status === 'booked').length : 0;
      doc.totalSeats = doc.seats ? doc.seats.length : 0;
      doc.availableSeats = doc.totalSeats - bookedCount;
      doc.bookedSeats = bookedCount;
      return doc;
    });

    res.json(formatted);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.json(show);
  } catch (e) {
    next(e);
  }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { movie, theatre, startsAt, price, rows = 6, seatsPerRow = 10 } = req.body;
    if (!await Movie.exists({ _id: movie }) || !await Theatre.exists({ _id: theatre })) {
      return res.status(400).json({ message: 'Select a valid movie and theatre' });
    }
    const showDate = new Date(startsAt);
    if (isNaN(showDate.getTime())) {
      return res.status(400).json({ message: 'Valid show date and time required' });
    }

    const safeRows = Math.max(1, Math.min(15, Number(rows) || 6));
    const safeSeatsPerRow = Math.max(1, Math.min(25, Number(seatsPerRow) || 10));

    const seats = [];
    for (let r = 0; r < safeRows; r++) {
      for (let c = 1; c <= safeSeatsPerRow; c++) {
        seats.push({
          seatNumber: `${String.fromCharCode(65 + r)}${c}`,
          status: 'available'
        });
      }
    }

    const newShow = await Show.create({
      movie,
      theatre,
      startsAt: showDate,
      price: Math.max(0, Number(price) || 200),
      seats
    });

    const populated = await Show.findById(newShow._id)
      .populate('movie', 'title posterUrl durationMinutes language')
      .populate('theatre', 'name city address');

    res.status(201).json(populated);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const s = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('movie', 'title posterUrl')
      .populate('theatre', 'name city');
    if (!s) return res.status(404).json({ message: 'Show not found' });
    res.json(s);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ message: 'Show not found' });

    // Cancel any confirmed bookings associated with this show
    await Booking.updateMany({ show: req.params.id, status: 'confirmed' }, { status: 'cancelled', paymentStatus: 'refunded' });

    await Show.findByIdAndDelete(req.params.id);
    res.json({ message: 'Show and associated bookings deleted successfully' });
  } catch (e) {
    next(e);
  }
});

router.get('/:id/seats', async (req, res, next) => {
  try {
    const s = await Show.findById(req.params.id).select('seats price startsAt');
    if (!s) return res.status(404).json({ message: 'Show not found' });
    res.json({ seats: s.seats, price: s.price, startsAt: s.startsAt });
  } catch (e) {
    next(e);
  }
});

export default router;
