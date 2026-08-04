export const API_BASE = '/api/v1';

export const API_ENDPOINTS = {
  // Auth
  LOGIN:          `${API_BASE}/auth/login`,
  REGISTER:       `${API_BASE}/auth/register`,
  LOGOUT:         `${API_BASE}/auth/logout`,
  ME:             `${API_BASE}/auth/me`,
  VERIFY_EMAIL:   `${API_BASE}/auth/verify-email`,
  FORGOT_PASSWORD:`${API_BASE}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE}/auth/reset-password`,

  // Clearance
  CLEARANCE:      `${API_BASE}/clearance`,
  SUBMIT:         `${API_BASE}/clearance/submit`,
  MY_CLEARANCE:   `${API_BASE}/clearance/my`,

  // Documents
  DOCUMENTS:      `${API_BASE}/documents`,
  UPLOAD:         `${API_BASE}/documents/upload`,

  // Notifications
  NOTIFICATIONS:  `${API_BASE}/notifications`,

  // Admin
  USERS:          `${API_BASE}/admin/users`,
  DEPARTMENTS_API:`${API_BASE}/admin/departments`,
  AUDIT_LOGS:     `${API_BASE}/admin/logs`,

  // Certificate
  CERTIFICATE:    `${API_BASE}/certificates`,
};