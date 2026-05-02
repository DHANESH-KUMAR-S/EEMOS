const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true },
  originalName:{ type: String, required: true },
  path:        { type: String, required: true },  // server path
  size:        { type: Number, default: 0 },
  mimetype:    { type: String, default: '' },
  folder:      { type: String, default: '/' },    // virtual folder path
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);
