import { Router } from 'express';
import Theatre from '../models/Theatre.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.city ? { city: new RegExp(String(req.query.city), 'i') } : {};
    res.json(await Theatre.find(filter).sort({ city: 1, name: 1 }));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ message: 'Theatre not found' });
    res.json(theatre);
  } catch (e) {
    next(e);
  }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json(theatre);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const t = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ message: 'Theatre not found' });
    res.json(t);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const t = await Theatre.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ message: 'Theatre not found' });
    res.json({ message: 'Theatre deleted' });
  } catch (e) {
    next(e);
  }
});

export default router;
