const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/auth');
const roles       = require('../middleware/roles');
const { handleUpload } = require('../middleware/upload');
const controller  = require('../controllers/documentController');

router.use(protect);

router.post  ('/upload',              roles('student'), handleUpload('file'), controller.uploadDocument);
router.get   ('/my',                  roles('student'), controller.getMyDocuments);
router.get   ('/student/:studentId',  roles('officer', 'registrar', 'admin'), controller.getDocumentsByStudent);
router.get   ('/:id/download',        controller.downloadDocument);
router.get   ('/:id/view',            controller.viewDocument);
router.delete('/:id',                 roles('student'), controller.deleteDocument);

module.exports = router;