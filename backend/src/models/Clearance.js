const mongoose = require('mongoose');

const departmentStepSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  departmentName: String,
  status: { type: String, enum: ['pending', 'in_review', 'approved', 'rejected'], default: 'pending' },
  officer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: String,
  reviewedAt: Date,
}, { _id: true });

const clearanceSchema = new mongoose.Schema({
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestId: { type: String, unique: true },
  status: { type: String, enum: ['draft', 'submitted', 'in_progress', 'completed', 'rejected'], default: 'submitted' },
  graduationYear:   String,
  programme:        String,
  sessionCompleted: String,
  remarks:          String,
  departments: [departmentStepSchema],
  submittedAt: Date,
  completedAt: Date,
  registrarApprovedAt: Date,
  registrar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registrarComment: String,
  certificateIssued:   { type: Boolean, default: false },
  certificateIssuedAt: Date,
}, { timestamps: true });

clearanceSchema.pre('save', async function () {
  if (!this.requestId) {
    const year  = new Date().getFullYear();
    const count = await mongoose.model('Clearance').countDocuments();
    this.requestId = `CLR-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Clearance', clearanceSchema);