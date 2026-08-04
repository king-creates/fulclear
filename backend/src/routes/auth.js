const express     = require('express');
const router      = express.Router();
const controller  = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',            controller.register);
router.post('/verify-email',        controller.verifyEmail);
router.post('/resend-verification', controller.resendVerification);
router.post('/login',               controller.login);
router.post('/logout', protect,     controller.logout);
router.get ('/me',     protect,     controller.getMe);
router.post('/forgot-password',     controller.forgotPassword);
router.post('/reset-password',      controller.resetPassword);

module.exports = router;