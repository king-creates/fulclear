const User         = require('../models/User');
const Department    = require('../models/Department');
const AuditLog       = require('../models/AuditLog');
const Clearance       = require('../models/Clearance');
const createAuditLog = require('../utils/auditLog');

/* ── Users ── */
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users, total: users.length });
  } catch (error) { next(error); }
};

exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create({ ...req.body, isEmailVerified: true });
    await createAuditLog({ user: req.user, action: 'USER_CREATED', detail: `Created ${user.role} account: ${user.email}`, req });
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ success: true, user: userObj });
  } catch (error) { next(error); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await createAuditLog({ user: req.user, action: 'USER_UPDATED', detail: `Updated user: ${user.email}`, req });
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await User.findByIdAndDelete(req.params.id);
    await createAuditLog({ user: req.user, action: 'USER_DELETED', detail: `Deleted user: ${user.email}`, req });
    res.json({ success: true, message: 'User deleted.' });
  } catch (error) { next(error); }
};

/* ── Departments ── */
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('officers', 'firstName lastName email')
      .populate('headOfficer', 'firstName lastName')
      .sort({ order: 1 });
    res.json({ success: true, departments });
  } catch (error) { next(error); }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    await createAuditLog({ user: req.user, action: 'DEPT_CREATED', detail: `Created department: ${department.name}`, req });
    res.status(201).json({ success: true, department });
  } catch (error) { next(error); }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) return res.status(404).json({ success: false, message: 'Department not found.' });

    await createAuditLog({ user: req.user, action: 'DEPT_UPDATED', detail: `Updated department: ${department.name}`, req });
    res.json({ success: true, department });
  } catch (error) { next(error); }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found.' });

    await Department.findByIdAndDelete(req.params.id);
    await createAuditLog({ user: req.user, action: 'DEPT_DELETED', detail: `Deleted department: ${department.name}`, req });
    res.json({ success: true, message: 'Department deleted.' });
  } catch (error) { next(error); }
};

/* ── Officer Assignment ── */
exports.assignOfficer = async (req, res, next) => {
  try {
    const { officerId, departmentId } = req.body;

    /* Remove officer from any other department first */
    await Department.updateMany({ officers: officerId }, { $pull: { officers: officerId } });

    const department = await Department.findByIdAndUpdate(
      departmentId,
      { $addToSet: { officers: officerId } },
      { new: true }
    ).populate('officers', 'firstName lastName email');

    const officer = await User.findByIdAndUpdate(officerId, { department: department.name }, { new: true }).select('-password');

    await createAuditLog({
      user: req.user,
      action: 'OFFICER_ASSIGNED',
      detail: `Assigned ${officer.fullName} to ${department.name}`,
      req,
    });

    res.json({ success: true, department, officer });
  } catch (error) { next(error); }
};

exports.unassignOfficer = async (req, res, next) => {
  try {
    const officer = await User.findById(req.params.officerId);
    await Department.updateMany({ officers: req.params.officerId }, { $pull: { officers: req.params.officerId } });

    await createAuditLog({
      user: req.user,
      action: 'OFFICER_UNASSIGNED',
      detail: `Unassigned ${officer?.fullName || 'officer'} from their department`,
      req,
    });

    res.json({ success: true, message: 'Officer unassigned.' });
  } catch (error) { next(error); }
};

/* ── Audit Logs ── */
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { role, search, severity, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.userRole = role;
    if (severity && severity !== 'all') filter.severity = severity;
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action:   { $regex: search, $options: 'i' } },
        { detail:   { $regex: search, $options: 'i' } },
      ];
    }

    const total = await AuditLog.countDocuments(filter);
    const logs  = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, logs, total });
  } catch (error) { next(error); }
};

/* ── Reports ── */
exports.getReports = async (req, res, next) => {
  try {
    const totalStudents   = await User.countDocuments({ role: 'student' });
    const totalClearances = await Clearance.countDocuments();
    const completed        = await Clearance.countDocuments({ status: 'completed' });
    const inProgress        = await Clearance.countDocuments({ status: { $in: ['submitted', 'in_progress'] } });

    const departments = await Department.find().sort({ order: 1 });
    const deptStats = [];

    for (const dept of departments) {
      const clearances = await Clearance.find({ 'departments.department': dept._id });
      let approved = 0, rejected = 0, pending = 0;

      clearances.forEach(c => {
        const step = c.departments.find(d => d.department.toString() === dept._id.toString());
        if (step?.status === 'approved') approved++;
        else if (step?.status === 'rejected') rejected++;
        else pending++;
      });

      deptStats.push({
        department: dept.name,
        total: clearances.length,
        approved, rejected, pending,
      });
    }

    res.json({
      success: true,
      summary: { totalStudents, totalClearances, completed, inProgress },
      departmentStats: deptStats,
    });
  } catch (error) { next(error); }
};

/* ── System Config (basic key-value, extend as needed) ── */
exports.getConfig = async (req, res, next) => {
  res.json({
    success: true,
    config: {
      systemName: 'FUL Student Clearance System',
      sessionYear: '2024/2025',
      maxFileSize: 5,
      allowedTypes: 'pdf,jpg,jpeg,png',
      maintenanceMode: false,
    },
  });
};

exports.updateConfig = async (req, res, next) => {
  try {
    await createAuditLog({ user: req.user, action: 'CONFIG_UPDATED', detail: 'System configuration updated', req });
    res.json({ success: true, message: 'Configuration saved.', config: req.body });
  } catch (error) { next(error); }
};