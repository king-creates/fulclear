const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clearance: { type: mongoose.Schema.Types.ObjectId, ref: 'Clearance' },
  documentType: {
    type: String,
    required: true,
    enum: ['passport', 'studentId', 'paymentProof', 'result', 'hostelForm', 'libraryForm', 'other'],
  },
  originalName: String,
  fileName:     String,
  filePath:     String,
  fileSize:     Number,
  mimeType:     String,
  uploadedAt:   { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);