const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const auth = require('../middleware/auth');

router.use(auth);

// Configure multer — store files in uploads/<userId>/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads', req.user.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// GET files (optionally filter by folder)
router.get('/', async (req, res) => {
  try {
    const { folder = '/' } = req.query;
    const files = await File.find({ user: req.user.id, folder }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { folder = '/' } = req.body;
    const file = await File.create({
      user: req.user.id,
      name: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.user.id}/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      folder
    });
    res.status(201).json(file);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH rename file
router.patch('/:id', async (req, res) => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { originalName: req.body.name },
      { new: true }
    );
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE file
router.delete('/:id', async (req, res) => {
  try {
    const file = await File.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    // Remove from disk
    const diskPath = path.join(__dirname, '../..', file.path);
    if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
