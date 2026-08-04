const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userRole: String,
  action:   { type: String, required: true },
  detail:   String,
  ipAddress: String,
  userAgent: String,
  status:   { type: String, enum: ['success', 'failure'], default: 'success' },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);