const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Department name is required'], unique: true, trim: true },
  code: { type: String, required: [true, 'Department code is required'], unique: true, uppercase: true, trim: true },
  description: String,
  officers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  headOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);