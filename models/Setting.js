const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: String, required: true },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

module.exports = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
