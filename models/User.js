const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member', index: true },
  sub_role: { type: String, default: 'member' },
  max_books: { type: Number, default: 3 },
  phone: { type: String, default: null },
  dark_mode: { type: Number, default: 0 },
  wallet_balance: { type: Number, default: 1200 },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
