const router = require('express').Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');

// All routes require auth
router.use(auth);

// GET all notes for user
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create note
router.post('/', async (req, res) => {
  try {
    const note = await Note.create({ user: req.user.id, ...req.body });
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH update note
router.patch('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE note
router.delete('/:id', async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
