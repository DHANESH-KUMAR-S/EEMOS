const router = require('express').Router();
const { db } = require('../config/gcp');
const auth   = require('../middleware/auth');

router.use(auth);

const ref = (uid) => db.collection('desktops').doc(uid);

const DEFAULT_DESKTOP = {
  enabledApps: ['filemanager', 'notes', 'settings', 'appstore'],
  wallpaper:   'gradient1',
  theme:       'dark',
  icons:       [],
};

// GET desktop layout
router.get('/', async (req, res) => {
  try {
    const snap = await ref(req.user.id).get();
    if (!snap.exists) {
      // Auto-create on first access
      const data = { uid: req.user.id, ...DEFAULT_DESKTOP, updatedAt: new Date().toISOString() };
      await ref(req.user.id).set(data);
      return res.json(data);
    }
    res.json(snap.data());
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH save layout
router.patch('/', async (req, res) => {
  try {
    const allowed = ['icons', 'wallpaper', 'theme', 'enabledApps'];
    const updates = { updatedAt: new Date().toISOString() };
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    await ref(req.user.id).set(updates, { merge: true });
    const snap = await ref(req.user.id).get();
    res.json(snap.data());
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
