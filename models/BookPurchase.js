const mongoose = require('mongoose');

const bookPurchaseSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sqlite_user_id: { type: Number, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  sqlite_book_id: { type: Number, default: null },
  marketplace_book: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceBook' },
  sqlite_marketplace_id: { type: Number, default: null },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  purchase_type: { type: String, enum: ['library_sale', 'marketplace'], required: true },
  payment_method: { type: String, default: 'wallet' },
  status: { type: String, default: 'completed' },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.models.BookPurchase || mongoose.model('BookPurchase', bookPurchaseSchema);
