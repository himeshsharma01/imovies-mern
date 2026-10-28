import { Router } from 'express';
import Movie from '../models/Movie.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12));
    const filter = {};

    if (req.query.all !== 'true') {
      filter.active = true;
    }

    if (req.query.genre) {
      filter.genres = req.query.genre;
    }

    if (req.query.language) {
      filter.language = req.query.language;
    }

    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { genres: { $regex: q, $options: 'i' } }
      ];
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === 'rating') sort = { rating: -1, title: 1 };
    else if (req.query.sort === 'title') sort = { title: 1 };
    else if (req.query.sort === 'duration') sort = { durationMinutes: -1 };
    else if (req.query.sort === 'oldest') sort = { createdAt: 1 };

    const [items, total] = await Promise.all([
      Movie.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Movie.countDocuments(filter)
    ]);

    res.json({ items, page, pages: Math.ceil(total / limit), total });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (e) {
    next(e);
  }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie deleted' });
  } catch (e) {
    next(e);
  }
});

export default router;
