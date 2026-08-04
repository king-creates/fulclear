import api from './api';

const adminService = {
  // Users
  getUsers:    (params) => api.get('/admin/users', { params }),
  createUser:  (data)   => api.post('/admin/users', data),
  updateUser:  (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser:  (id)     => api.delete(`/admin/users/${id}`),

  // Departments
  getDepartments:    ()       => api.get('/admin/departments'),
  createDepartment:  (data)   => api.post('/admin/departments', data),
  updateDepartment:  (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment:  (id)     => api.delete(`/admin/departments/${id}`),

  // Officers
  assignOfficer:   (data) => api.post('/admin/assign-officer', data),
  unassignOfficer: (id)   => api.delete(`/admin/assign-officer/${id}`),

  // Logs
  getAuditLogs: (params) => api.get('/admin/logs', { params }),

  // Reports
  getReports: (params) => api.get('/admin/reports', { params }),

  // Config
  getConfig:    ()     => api.get('/admin/config'),
  updateConfig: (data) => api.put('/admin/config', data),
};

export default adminService;