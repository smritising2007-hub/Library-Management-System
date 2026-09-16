const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sqlite_user_id: { type: Number, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  sqlite_book_id: { type: Number, index: true },
  progress_pct: { type: Number, default: 0, min: 0, max: 100 },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

readingProgressSchema.index({ sqlite_user_id: 1, sqlite_book_id: 1 }, { unique: true });

module.exports = mongoose.models.ReadingProgress || mongoose.model('ReadingProgress', readingProgressSchema);
