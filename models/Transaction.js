const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  sqlite_book_id: { type: Number, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sqlite_user_id: { type: Number, index: true },
  issue_date: { type: String, required: true },
  due_date: { type: String, required: true },
  return_date: { type: String, default: null },
  fine: { type: Number, default: 0 },
  fine_paid: { type: Number, default: 0 },
  status: { type: String, enum: ['issued', 'returned', 'overdue'], default: 'issued', index: true },
  renewed_count: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
