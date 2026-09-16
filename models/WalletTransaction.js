const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sqlite_user_id: { type: Number, index: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
