import api from './api';

const clearanceService = {
  submit:        (data)   => api.post('/clearance/submit', data),
  getMy:         ()       => api.get('/clearance/my'),
  getDepartments: ()      => api.get('/clearance/departments/list'),

  getDepartmentRequests: (status) => api.get('/clearance/department/requests', { params: { status } }),
  getRequestDetail:      (id)     => api.get(`/clearance/${id}/detail`),
  approve:               (id, comment) => api.patch(`/clearance/${id}/approve`, { comment }),
  reject:                (id, comment) => api.patch(`/clearance/${id}/reject`,  { comment }),
  resubmitStep:          (clearanceId, stepId) => api.patch(`/clearance/${clearanceId}/steps/${stepId}/resubmit`),

  getFinalQueue:   ()             => api.get('/clearance/registrar/queue'),
  finalApprove:    (id, comment)  => api.patch(`/clearance/${id}/final-approve`, { comment }),

  getAll:      (params) => api.get('/clearance', { params }),
  getById:     (id)     => api.get(`/clearance/${id}`),
};

export default clearanceService;