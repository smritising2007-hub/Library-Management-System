const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sqlite_user_id: { type: Number, index: true },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  ip_address: { type: String, default: '127.0.0.1' },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
