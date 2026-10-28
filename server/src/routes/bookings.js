import { Router } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { io } from '../server.js';

const router = Router();
router.use(protect);

// Helper function to safely execute with transaction or fallback
async function executeWithTransactionOrFallback(fn) {
  let session = null;
  try {
    session = await mongoose.startSession();
    let result;
    try {
      await session.withTransaction(async () => {
        result = await fn(session);
      });
      return result;
    } catch (txErr) {
      // If transaction fails specifically because replica set is not configured, fallback to standalone execution
      if (txErr.message?.includes('replica set') || txErr.message?.includes('Transaction numbers') || txErr.code === 20) {
        console.warn('MongoDB transactions unsupported on this instance, falling back to standalone execution');
        return await fn(null);
      }
      throw txErr;
    } finally {
      await session.endSession();
    }
  } catch (sessionErr) {
    // If sessions themselves are unsupported
    if (sessionErr.message?.includes('Sessions are not supported') || sessionErr.message?.includes('replica set')) {
      return await fn(null);
    }
    throw sessionErr;
  }
}

router.post('/', async (req, res, next) => {
  const { showId, seats, paymentMethod = 'demo-online' } = req.body;
  if (!showId || !Array.isArray(seats) || seats.length < 1 || seats.length > 10 || new Set(seats).size !== seats.length) {
    return res.status(400).json({ message: 'Choose between 1 and 10 unique seats' });
  }

  try {
    const createdBooking = await executeWithTransactionOrFallback(async (session) => {
      const showQuery = Show.findById(showId);
      if (session) showQuery.session(session);
      const show = await showQuery;

      if (!show) throw Object.assign(new Error('Show not found'), { status: 404 });
      if (new Date(show.startsAt) <= new Date()) {
        throw Object.assign(new Error('This show has already started'), { status: 400 });
      }

      const chosen = show.seats.filter(s => seats.includes(s.seatNumber));
      if (chosen.length !== seats.length) {
        throw Object.assign(new Error('One or more selected seats are invalid for this show'), { status: 400 });
      }
      if (chosen.some(s => s.status !== 'available')) {
        throw Object.assign(new Error('One or more selected seats were just taken. Please choose different seats.'), { status: 409 });
      }

      const totalAmount = show.price * seats.length;
      let bookingDoc;
      if (session) {
        const created = await Booking.create(
          [{
            user: req.user._id,
            show: show._id,
            movie: show.movie,
            theatre: show.theatre,
            seats,
            totalAmount,
            status: 'confirmed',
            paymentStatus: 'demo-paid'
          }],
          { session }
        );
        bookingDoc = created[0];
      } else {
        bookingDoc = await Booking.create({
          user: req.user._id,
          show: show._id,
          movie: show.movie,
          theatre: show.theatre,
          seats,
          totalAmount,
          status: 'confirmed',
          paymentStatus: 'demo-paid'
        });
      }

      show.seats.forEach(s => {
        if (seats.includes(s.seatNumber)) {
          s.status = 'booked';
          s.booking = bookingDoc._id;
        }
      });

      if (session) {
        await show.save({ session });
      } else {
        await show.save();
      }

      return bookingDoc;
    });

    // Notify all clients of seat availability changes
    const updated = await Show.findById(showId).select('seats');
    io.emit('seats:updated', { showId, seats: updated?.seats || [] });

    const fullBooking = await Booking.findById(createdBooking._id)
      .populate('user', 'name email')
      .populate('movie', 'title posterUrl durationMinutes language rating genres')
      .populate('theatre', 'name city address')
      .populate('show', 'startsAt price');

    res.status(201).json(fullBooking);
  } catch (e) {
    next(e);
  }
});

router.get('/mine', async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title posterUrl durationMinutes language')
      .populate('theatre', 'name city address')
      .populate('show', 'startsAt price')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('movie', 'title posterUrl durationMinutes language rating genres')
      .populate('theatre', 'name city address')
      .populate('show', 'startsAt price');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Allow owner or admin
    if (!booking.user._id.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (e) {
    next(e);
  }
});

router.get('/', adminOnly, async (_req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('movie', 'title posterUrl')
      .populate('theatre', 'name city')
      .populate('show', 'startsAt price')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(bookings);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const updatedBooking = await executeWithTransactionOrFallback(async (session) => {
      const filter = { _id: req.params.id, status: 'confirmed' };
      if (req.user.role !== 'admin') {
        filter.user = req.user._id;
      }

      const bookingQuery = Booking.findOne(filter);
      if (session) bookingQuery.session(session);
      const booking = await bookingQuery;

      if (!booking) {
        throw Object.assign(new Error('Booking not found or already cancelled'), { status: 404 });
      }

      const showQuery = Show.findById(booking.show);
      if (session) showQuery.session(session);
      const show = await showQuery;

      if (show) {
        // If not admin, check if show has already started
        if (req.user.role !== 'admin' && new Date(show.startsAt) <= new Date()) {
          throw Object.assign(new Error('Cannot cancel tickets after show has started'), { status: 400 });
        }
        show.seats.forEach(s => {
          if (booking.seats.includes(s.seatNumber)) {
            s.status = 'available';
            s.booking = null;
          }
        });
        if (session) await show.save({ session });
        else await show.save();
      }

      booking.status = 'cancelled';
      booking.paymentStatus = 'refunded';
      if (session) await booking.save({ session });
      else await booking.save();

      return booking;
    });

    const updatedShow = await Show.findById(updatedBooking.show).select('seats');
    io.emit('seats:updated', { showId: String(updatedBooking.show), seats: updatedShow?.seats || [] });

    res.json(updatedBooking);
  } catch (e) {
    next(e);
  }
});

export default router;
