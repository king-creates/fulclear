const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['success', 'info', 'warning', 'danger'], default: 'info' },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
  readAt:  Date,
  link:    String,
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);