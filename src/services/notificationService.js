import api from './api';

const notificationService = {
  getAll:      ()   => api.get('/notifications'),
  markRead:    (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()   => api.patch('/notifications/read-all'),
  deleteOne:   (id) => api.delete(`/notifications/${id}`),
};

export default notificationService;