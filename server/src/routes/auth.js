import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const tokenFor = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length < 8) {
      return res.status(400).json({ message: 'Provide name, valid email, and password of at least 8 characters' });
    }
    if (await User.exists({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password: await bcrypt.hash(password, 12) });
    res.status(201).json({
      token: tokenFor(user),
      user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password || '', user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      token: tokenFor(user),
      user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name?.trim() || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Valid name and email are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use by another account' });
    }
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), email: email.toLowerCase() },
      { new: true }
    ).select('_id name email role');
    res.json({ user: updated, message: 'Profile updated successfully' });
  } catch (e) {
    next(e);
  }
});

router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await bcrypt.compare(currentPassword || '', user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (e) {
    next(e);
  }
});

export default router;
