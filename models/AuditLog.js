const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  user_id: { type: Number, index: true },
  user_name: { type: String, default: '' },
  action: { type: String, required: true },
  target_type: { type: String, default: null },
  target_id: { type: Number, default: null },
  details: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
