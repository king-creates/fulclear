const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/auth');
const controller  = require('../controllers/certificateController');

router.use(protect);

router.get('/status',        controller.getCertificateStatus);
router.get('/:id/download',  controller.generateCertificate);

module.exports = router;