const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/gcp');
const auth   = require('../middleware/auth');

router.use(auth);

// Each user's notes live at: notes/{userId}/items/{noteId}
const col = (uid) => db.collection('notes').doc(uid).collection('items');

// GET all notes
router.get('/', async (req, res) => {
  try {
    // Get all then sort in memory — avoids needing a Firestore composite index
    const snap = await col(req.user.id).get();
    const notes = snap.docs
      .map(d => d.data())
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(notes);
  } catch (err) {
    console.error('GET /notes error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST create note
router.post('/', async (req, res) => {
  try {
    const id  = uuidv4();
    const now = new Date().toISOString();
    const note = {
      _id:       id,
      user:      req.user.id,
      title:     req.body.title   || 'Untitled Note',
      content:   req.body.content || '',
      color:     req.body.color   || '#fef08a',
      createdAt: now,
      updatedAt: now,
    };
    await col(req.user.id).doc(id).set(note);
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH update note
router.patch('/:id', async (req, res) => {
  try {
    const ref  = col(req.user.id).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: 'Note not found' });

    const updates = { updatedAt: new Date().toISOString() };
    ['title', 'content', 'color'].forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    await ref.update(updates);
    res.json({ ...snap.data(), ...updates });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE note
router.delete('/:id', async (req, res) => {
  try {
    await col(req.user.id).doc(req.params.id).delete();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
