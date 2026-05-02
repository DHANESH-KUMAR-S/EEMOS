const router = require('express').Router();
const { db } = require('../config/gcp');
const auth   = require('../middleware/auth');

router.use(auth);

const ALL_APPS = [
  { id: 'filemanager', name: 'File Manager', icon: '📁', description: 'Browse and manage your files' },
  { id: 'notes',       name: 'Notes',        icon: '📝', description: 'Create and edit notes' },
  { id: 'settings',    name: 'Settings',     icon: '⚙️',  description: 'Customize your desktop' },
  { id: 'appstore',    name: 'App Store',    icon: '🛍️',  description: 'Discover and install apps' },
  { id: 'calculator',  name: 'Calculator',   icon: '🧮', description: 'Simple calculator' },
  { id: 'clock',       name: 'Clock',        icon: '🕐', description: 'World clock and timer' },
  { id: 'browser',     name: 'Web Browser',  icon: '🌐', description: 'Browse the web' },
  { id: 'terminal',    name: 'Terminal',     icon: '💻', description: 'Command line interface' },
];

// GET all apps with enabled status
router.get('/', async (req, res) => {
  try {
    const snap    = await db.collection('desktops').doc(req.user.id).get();
    const enabled = snap.exists ? (snap.data().enabledApps || []) : ['filemanager', 'notes', 'settings', 'appstore'];
    res.json(ALL_APPS.map(a => ({ ...a, enabled: enabled.includes(a.id) })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH toggle app
router.patch('/:appId/toggle', async (req, res) => {
  try {
    const ref  = db.collection('desktops').doc(req.user.id);
    const snap = await ref.get();
    let enabled = snap.exists ? (snap.data().enabledApps || []) : [];

    const { appId } = req.params;
    enabled = enabled.includes(appId)
      ? enabled.filter(a => a !== appId)
      : [...enabled, appId];

    await ref.set({ enabledApps: enabled }, { merge: true });
    res.json({ enabledApps: enabled });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
