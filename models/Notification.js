const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sqlite_user_id: { type: Number, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'danger'], default: 'info' },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
