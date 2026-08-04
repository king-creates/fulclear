const express     = require('express');
const router      = express.Router();
const controller  = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get   ('/',         controller.getNotifications);
router.patch ('/:id/read', controller.markRead);
router.patch ('/read-all', controller.markAllRead);
router.delete('/:id',      controller.deleteNotification);

module.exports = router;