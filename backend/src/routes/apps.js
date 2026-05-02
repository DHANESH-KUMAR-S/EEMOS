const router = require('express').Router();
const Desktop = require('../models/Desktop');
const auth = require('../middleware/auth');

router.use(auth);

// All available apps in the store
const ALL_APPS = [
  { id: 'filemanager', name: 'File Manager', icon: '📁', description: 'Browse and manage your files' },
  { id: 'notes',       name: 'Notes',        icon: '📝', description: 'Create and edit notes' },
  { id: 'settings',    name: 'Settings',     icon: '⚙️',  description: 'Customize your desktop' },
  { id: 'appstore',    name: 'App Store',    icon: '🛍️',  description: 'Discover and install apps' },
  { id: 'calculator',  name: 'Calculator',   icon: '🧮', description: 'Simple calculator' },
  { id: 'clock',       name: 'Clock',        icon: '🕐', description: 'World clock and timer' },
  { id: 'browser',     name: 'Web Browser',  icon: '🌐', description: 'Browse the web' },
  { id: 'terminal',    name: 'Terminal',     icon: '💻', description: 'Command line interface' }
];

// GET all apps with enabled status
router.get('/', async (req, res) => {
  try {
    const desktop = await Desktop.findOne({ user: req.user.id });
    const enabled = desktop?.enabledApps || ['filemanager', 'notes', 'settings', 'appstore'];
    const apps = ALL_APPS.map(a => ({ ...a, enabled: enabled.includes(a.id) }));
    res.json(apps);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH toggle app enabled/disabled
router.patch('/:appId/toggle', async (req, res) => {
  try {
    const desktop = await Desktop.findOne({ user: req.user.id });
    let enabled = desktop?.enabledApps || [];
    const { appId } = req.params;

    if (enabled.includes(appId)) {
      enabled = enabled.filter(a => a !== appId);
    } else {
      enabled.push(appId);
    }

    await Desktop.findOneAndUpdate({ user: req.user.id }, { enabledApps: enabled }, { upsert: true });
    res.json({ enabledApps: enabled });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
