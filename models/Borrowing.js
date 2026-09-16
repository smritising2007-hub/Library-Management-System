const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sqlite_user_id: { type: Number, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  sqlite_book_id: { type: Number, index: true },
  borrow_date: { type: Date, default: Date.now },
  due_date: { type: Date, required: true },
  return_date: { type: Date, default: null },
  status: { type: String, enum: ['borrowed', 'returned', 'overdue'], default: 'borrowed', index: true },
  fine_amount: { type: Number, default: 0 },
  fine_paid: { type: Boolean, default: false },
  renew_count: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.models.Borrowing || mongoose.model('Borrowing', borrowingSchema);
