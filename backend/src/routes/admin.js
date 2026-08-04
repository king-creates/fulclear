const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/auth');
const roles       = require('../middleware/roles');
const controller  = require('../controllers/adminController');

router.use(protect);
router.use(roles('admin'));

/* Users */
router.get   ('/users',      controller.getUsers);
router.post  ('/users',      controller.createUser);
router.put   ('/users/:id',  controller.updateUser);
router.delete('/users/:id',  controller.deleteUser);

/* Departments */
router.get   ('/departments',      controller.getDepartments);
router.post  ('/departments',      controller.createDepartment);
router.put   ('/departments/:id',  controller.updateDepartment);
router.delete('/departments/:id',  controller.deleteDepartment);

/* Officers */
router.post  ('/assign-officer',            controller.assignOfficer);
router.delete('/assign-officer/:officerId', controller.unassignOfficer);

/* Logs */
router.get('/logs', controller.getAuditLogs);

/* Reports */
router.get('/reports', controller.getReports);

/* Config */
router.get('/config', controller.getConfig);
router.put('/config', controller.updateConfig);

module.exports = router;