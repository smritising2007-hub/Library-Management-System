const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sqlite_user_id: { type: Number, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  sqlite_book_id: { type: Number, index: true },
  reserved_at: { type: Date, default: Date.now },
  status: { type: String, enum: ['waiting', 'notified', 'fulfilled', 'cancelled'], default: 'waiting', index: true },
  notified_at: { type: Date, default: null },
  expires_at: { type: Date, default: null }
}, {
  timestamps: { createdAt: 'reserved_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
