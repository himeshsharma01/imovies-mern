import { Router } from 'express';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/stats', async (_req, res, next) => {
  try {
    const [
      totalMovies,
      totalTheatres,
      totalShows,
      totalUsers,
      bookingsCount,
      confirmedBookingsCount,
      revenueResult,
      recentBookings
    ] = await Promise.all([
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments(),
      User.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.find()
        .populate('user', 'name email')
        .populate('movie', 'title posterUrl')
        .populate('theatre', 'name city')
        .populate('show', 'startsAt price')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      totalMovies,
      totalTheatres,
      totalShows,
      totalUsers,
      totalBookings: bookingsCount,
      confirmedBookings: confirmedBookingsCount,
      totalRevenue,
      recentBookings
    });
  } catch (e) {
    next(e);
  }
});

router.get('/users', async (_req, res, next) => {
  try {
    const users = await User.find().select('_id name email role createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('_id name email role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

export default router;
