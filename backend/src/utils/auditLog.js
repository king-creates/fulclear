const AuditLog = require('../models/AuditLog');

const HIGH_SEVERITY_ACTIONS = [
  'LOGIN_FAILED',
  'USER_DELETED',
  'PASSWORD_RESET',
  'CLEARANCE_REJECTED',
  'DEPT_DELETED',
];

const MEDIUM_SEVERITY_ACTIONS = [
  'USER_CREATED',
  'USER_UPDATED',
  'OFFICER_ASSIGNED',
  'OFFICER_UNASSIGNED',
  'FINAL_APPROVAL',
  'CERTIFICATE_DOWNLOADED',
  'CONFIG_UPDATED',
  'CLEARANCE_RESUBMITTED',
];

const getSeverity = (action) => {
  if (HIGH_SEVERITY_ACTIONS.includes(action))   return 'high';
  if (MEDIUM_SEVERITY_ACTIONS.includes(action)) return 'medium';
  return 'low';
};

const createAuditLog = async ({ user, action, detail, req, status = 'success' }) => {
  try {
    await AuditLog.create({
      user:      user?._id  || user,
      userName:  user?.fullName || user?.firstName || 'System',
      userRole:  user?.role || 'system',
      action,
      detail,
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.headers?.['user-agent'] || 'unknown',
      status,
      severity: getSeverity(action),
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

module.exports = createAuditLog;