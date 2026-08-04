export const ROUTES = {
  // Public
  HOME:           '/',
  LOGIN:          '/login',
  REGISTER:       '/register',
  VERIFY_EMAIL:   '/verify-email',
  FORGOT_PASSWORD:'/forgot-password',

  // Student
  STUDENT_DASHBOARD:   '/student/dashboard',
  STUDENT_SUBMIT:      '/student/submit',
  STUDENT_STATUS:      '/student/status',
  STUDENT_DOCUMENTS:   '/student/documents',
  STUDENT_HISTORY:     '/student/history',
  STUDENT_CERTIFICATE: '/student/certificate',
  STUDENT_NOTIFICATIONS:'/student/notifications',

  // Officer
  OFFICER_DASHBOARD:      '/officer/dashboard',
  OFFICER_REQUESTS:       '/officer/requests',
  OFFICER_REQUEST_DETAIL: '/officer/requests/:id',
  OFFICER_NOTIFICATIONS:  '/officer/notifications',

  // Registrar
  REGISTRAR_DASHBOARD:    '/registrar/dashboard',
  REGISTRAR_VERIFICATION: '/registrar/verification',
  REGISTRAR_CERTIFICATES: '/registrar/certificates',
  REGISTRAR_REPORTS:      '/registrar/reports',

  // Admin
  ADMIN_DASHBOARD:   '/admin/dashboard',
  ADMIN_USERS:       '/admin/users',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_OFFICERS:    '/admin/officers',
  ADMIN_LOGS:        '/admin/logs',
  ADMIN_CONFIG:      '/admin/config',
  ADMIN_REPORTS:     '/admin/reports',

  NOT_FOUND: '*',
};