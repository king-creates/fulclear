const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/auth');
const roles       = require('../middleware/roles');
const controller  = require('../controllers/clearanceController');

router.use(protect);
const Department = require('../models/Department');

router.get('/departments/list', async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, departments });
  } catch (error) { next(error); }
});

/* Student */
router.post('/submit',       roles('student'), controller.submitClearance);
router.get ('/my',           roles('student'), controller.getMyClearance);

/* Officer */
router.get ('/department/requests', roles('officer'), controller.getDepartmentRequests);
router.get ('/:id/detail',          roles('officer', 'registrar', 'admin'), controller.getRequestDetail);
router.patch('/:id/approve',        roles('officer'), controller.approveStep);
router.patch('/:id/reject',         roles('officer'), controller.rejectStep);
router.patch('/:id/steps/:stepId/resubmit', roles('student'), controller.resubmitStep);

/* Registrar */
router.get ('/registrar/queue',     roles('registrar'), controller.getFinalVerificationQueue);
router.patch('/:id/final-approve',  roles('registrar'), controller.grantFinalClearance);

/* Shared — admin, registrar */
router.get ('/', roles('officer', 'registrar', 'admin'), controller.getAllClearances);
router.get ('/:id', roles('student', 'officer', 'registrar', 'admin'), controller.getClearanceById);

module.exports = router;