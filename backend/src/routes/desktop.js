const router = require('express').Router();
const Desktop = require('../models/Desktop');
const auth = require('../middleware/auth');

router.use(auth);

// GET desktop layout
router.get('/', async (req, res) => {
  try {
    let desktop = await Desktop.findOne({ user: req.user.id });
    if (!desktop) desktop = await Desktop.create({ user: req.user.id });
    res.json(desktop);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH save layout (icons, wallpaper, theme)
router.patch('/', async (req, res) => {
  try {
    const desktop = await Desktop.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, upsert: true }
    );
    res.json(desktop);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
