const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db }  = require('../config/gcp');
const auth    = require('../middleware/auth');

const USERS = db.collection('users');

// ── helpers ──────────────────────────────────────────────────────────────────

const signToken = (uid, username) =>
  jwt.sign({ id: uid, username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const safeUser = (doc) => {
  const { passwordHash, ...rest } = doc;
  return rest;
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // Check uniqueness — query by email
    const emailSnap = await USERS.where('email', '==', email.toLowerCase()).limit(1).get();
    if (!emailSnap.empty)
      return res.status(409).json({ message: 'Email already registered' });

    const userSnap = await USERS.where('username', '==', username).limit(1).get();
    if (!userSnap.empty)
      return res.status(409).json({ message: 'Username already taken' });

    const uid          = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12);
    const now          = new Date().toISOString();

    const userData = {
      uid,
      username,
      email: email.toLowerCase(),
      passwordHash,
      avatar:    '',
      theme:     'dark',
      wallpaper: 'gradient1',
      createdAt: now,
      updatedAt: now,
    };

    // Store user doc with uid as document ID
    await USERS.doc(uid).set(userData);

    // Create default desktop layout
    await db.collection('desktops').doc(uid).set({
      uid,
      enabledApps: ['filemanager', 'notes', 'settings', 'appstore'],
      wallpaper:   'gradient1',
      theme:       'dark',
      icons:       [],
      updatedAt:   now,
    });

    const token = signToken(uid, username);
    res.status(201).json({ token, user: safeUser(userData) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const snap = await USERS.where('email', '==', email.toLowerCase()).limit(1).get();
    if (snap.empty)
      return res.status(401).json({ message: 'Invalid credentials' });

    const userData = snap.docs[0].data();
    const match    = await bcrypt.compare(password, userData.passwordHash);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(userData.uid, userData.username);
    res.json({ token, user: safeUser(userData) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const doc = await USERS.doc(req.user.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'User not found' });
    res.json(safeUser(doc.data()));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/auth/profile ───────────────────────────────────────────────────
router.patch('/profile', auth, async (req, res) => {
  try {
    const allowed = ['username', 'avatar', 'theme', 'wallpaper'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updatedAt = new Date().toISOString();

    await USERS.doc(req.user.id).update(updates);
    const doc = await USERS.doc(req.user.id).get();
    res.json(safeUser(doc.data()));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/auth/password ──────────────────────────────────────────────────
router.patch('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const doc  = await USERS.doc(req.user.id).get();
    const user = doc.data();
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Current password incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await USERS.doc(req.user.id).update({ passwordHash, updatedAt: new Date().toISOString() });
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/auth/theme ─────────────────────────────────────────────────────
router.patch('/theme', auth, async (req, res) => {
  try {
    const { theme } = req.body;
    await USERS.doc(req.user.id).update({ theme, updatedAt: new Date().toISOString() });
    await db.collection('desktops').doc(req.user.id).update({ theme });
    res.json({ theme });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
