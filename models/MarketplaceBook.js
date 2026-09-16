const mongoose = require('mongoose');

const marketplaceBookSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sqlite_seller_id: { type: Number, index: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, default: 'General' },
  price: { type: Number, required: true },
  condition: { type: String, enum: ['new', 'like_new', 'good', 'fair'], default: 'good' },
  description: { type: String, default: '' },
  cover_url: { type: String, default: null },
  status: { type: String, enum: ['active', 'sold', 'delisted'], default: 'active' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sqlite_buyer_id: { type: Number, default: null },
  sold_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.models.MarketplaceBook || mongoose.model('MarketplaceBook', marketplaceBookSchema);
