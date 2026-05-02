const router  = require('express').Router();
const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');
const path    = require('path');
const { db, bucket } = require('../config/gcp');
const auth    = require('../middleware/auth');

router.use(auth);

// Use memory storage — we stream directly to GCS, no local disk needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

const col = (uid) => db.collection('files').doc(uid).collection('items');

// ── GET /api/files?folder=/ ───────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const folder = req.query.folder || '/';
    const snap   = await col(req.user.id)
      .where('folder', '==', folder)
      .orderBy('createdAt', 'desc')
      .get();
    res.json(snap.docs.map(d => d.data()));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/files/upload ────────────────────────────────────────────────────
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const folder   = req.body.folder || '/';
    const fileId   = uuidv4();
    const ext      = path.extname(req.file.originalname);
    // GCS object path: users/{uid}/files/{fileId}{ext}
    const gcsPath  = `users/${req.user.id}/files/${fileId}${ext}`;
    const gcsFile  = bucket.file(gcsPath);

    // Upload buffer to GCS
    await gcsFile.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
    });

    // Make the file publicly readable so we can serve it directly
    await gcsFile.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsPath}`;
    const now       = new Date().toISOString();

    const fileDoc = {
      _id:          fileId,
      user:         req.user.id,
      originalName: req.file.originalname,
      gcsPath,
      publicUrl,
      size:         req.file.size,
      mimetype:     req.file.mimetype,
      folder,
      createdAt:    now,
    };

    await col(req.user.id).doc(fileId).set(fileDoc);
    res.status(201).json(fileDoc);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/files/:id  (rename) ───────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const ref  = col(req.user.id).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: 'File not found' });

    await ref.update({ originalName: req.body.name });
    res.json({ ...snap.data(), originalName: req.body.name });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/files/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const ref  = col(req.user.id).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ message: 'File not found' });

    const { gcsPath } = snap.data();

    // Delete from GCS
    await bucket.file(gcsPath).delete().catch(() => {}); // ignore if already gone

    // Delete Firestore record
    await ref.delete();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
