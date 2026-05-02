const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Desktop = require('../models/Desktop');
const auth = require('../middleware/auth');

const signToken = (user) =>
  jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message: 'User already exists' });

    const user = await User.create({ username, email, password });
    // Create default desktop layout for new user
    await Desktop.create({ user: user._id });

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, username, email, theme: user.theme } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, username: user.username, email, theme: user.theme } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/auth/theme
router.patch('/theme', auth, async (req, res) => {
  try {
    const { theme } = req.body;
    await User.findByIdAndUpdate(req.user.id, { theme });
    await Desktop.findOneAndUpdate({ user: req.user.id }, { theme });
    res.json({ theme });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
