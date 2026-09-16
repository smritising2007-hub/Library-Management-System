const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  name: { type: String, required: true, unique: true, trim: true }
}, {
  timestamps: true
});

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
