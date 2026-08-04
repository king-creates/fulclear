const jwt    = require('jsonwebtoken');
const crypto = require('crypto');

/* Short-lived access token */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });

/* Long-lived refresh token — random string, not a JWT, stored hashed in DB */
const generateRefreshToken = () => crypto.randomBytes(40).toString('hex');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateResetToken = () =>
  crypto.randomBytes(32).toString('hex');

module.exports = {
  generateToken,
  generateRefreshToken,
  hashToken,
  generateVerificationCode,
  generateResetToken,
};