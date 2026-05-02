const mongoose = require('mongoose');

// Stores per-user desktop layout: icon positions, open windows state
const desktopSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  icons: [
    {
      id:   String,
      x:    Number,
      y:    Number,
      app:  String
    }
  ],
  enabledApps: { type: [String], default: ['filemanager', 'notes', 'settings', 'appstore'] },
  wallpaper:   { type: String, default: 'default' },
  theme:       { type: String, default: 'dark' }
});

module.exports = mongoose.model('Desktop', desktopSchema);
