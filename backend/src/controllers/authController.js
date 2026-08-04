const User = require('../models/User');
const {
  generateToken,
  generateRefreshToken,
  hashToken,
  generateVerificationCode,
  generateResetToken,
} = require('../utils/generateToken');
const { sendEmail, queueEmail, emailTemplates } = require('../utils/sendEmails');
const createAuditLog = require('../utils/auditLog');
const crypto = require('crypto');


exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, matricNumber, department, programme } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const code   = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      firstName, lastName, email, password,
      matricNumber, department, programme,
      emailVerificationCode:   code,
      emailVerificationExpiry: expiry,
    });

    const template = emailTemplates.verificationCode(firstName, code);
    queueEmail({ to: email, ...template });

    await createAuditLog({ user, action: 'USER_REGISTERED', detail: `New student account created: ${email}`, req });

    res.status(201).json({ success: true, message: 'Account created. Please verify your email.' });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findOne({ emailVerificationCode: code, emailVerificationExpiry: { $gt: Date.now() } });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with that email.' });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Email is already verified.' });

    const code   = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerificationCode = code;
    user.emailVerificationExpiry = expiry;
    await user.save();

    const template = emailTemplates.verificationCode(user.firstName, code);
    queueEmail({ to: email, ...template });

    res.json({ success: true, message: 'Verification code resent.' });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    /* Locked account check */
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.registerFailedAttempt();
      await createAuditLog({ user, action: 'LOGIN_FAILED', detail: `Failed login attempt for ${email}`, req, status: 'failure' });

      const attemptsLeft = 5 - user.failedLoginAttempts;
      return res.status(401).json({
        success: false,
        message: attemptsLeft > 0
          ? `Invalid email or password. ${attemptsLeft} attempt(s) remaining before lockout.`
          : 'Account locked due to too many failed attempts. Try again in 15 minutes.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email before logging in.' });
    }

    /* Success — reset lockout counters */
    await user.resetFailedAttempts();

    user.lastLogin = new Date();

    const accessToken  = generateToken(user._id);
    const refreshToken = generateRefreshToken();

    user.refreshToken       = hashToken(refreshToken);
    user.refreshTokenExpiry = new Date(Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS) || 30) * 24 * 60 * 60 * 1000);
    await user.save();

    await createAuditLog({ user, action: 'LOGIN', detail: `User logged in: ${email}`, req });

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        _id:             user._id,
        firstName:       user.firstName,
        lastName:        user.lastName,
        email:           user.email,
        role:            user.role,
        department:      user.department,
        matricNumber:    user.matricNumber,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await createAuditLog({ user: req.user, action: 'LOGOUT', detail: 'User logged out', req });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

    const resetToken = generateResetToken();
    user.passwordResetToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const template  = emailTemplates.passwordReset(user.firstName, resetUrl);
    queueEmail({ to: email, ...template });

    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpiry: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    user.password            = password;
    user.passwordResetToken  = undefined;
    user.passwordResetExpiry = undefined;
    user.refreshToken       = undefined;
    user.refreshTokenExpiry = undefined;
    await user.save();

    await createAuditLog({
      user,
      action: 'PASSWORD_RESET',
      detail: `Password reset completed for ${user.email}`,
      req,
    });

    res.json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (error) {
    next(error);
  }
};