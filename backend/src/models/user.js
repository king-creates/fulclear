const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, 'First name is required'], trim: true },
  lastName:  { type: String, required: [true, 'Last name is required'],  trim: true },
  email: {
    type:      String,
    required:  [true, 'Email is required'],
    unique:    true,
    lowercase: true,
    trim:      true,
    match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
  role: { type: String, enum: ['student', 'officer', 'registrar', 'admin'], default: 'student' },
  matricNumber: { type: String, sparse: true, trim: true },
  department:   { type: String, trim: true },
  programme:    { type: String, trim: true },
  phone:        { type: String, trim: true },
  isEmailVerified: { type: Boolean, default: false },
  isActive:        { type: Boolean, default: true },
  emailVerificationCode:   String,
  emailVerificationExpiry: Date,
  passwordResetToken:      String,
  passwordResetExpiry:     Date,
  lastLogin: Date,

  /* ── Account lockout tracking ── */
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil:           Date,

  /* ── Refresh token tracking ── */
  refreshToken:       String,
  refreshTokenExpiry: Date,
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/* Is the account currently locked? */
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

/* Increment failed attempts, lock after 5 */
userSchema.methods.registerFailedAttempt = async function () {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  await this.save();
};

/* Reset attempts on successful login */
userSchema.methods.resetFailedAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);