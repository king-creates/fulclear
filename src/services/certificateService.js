import api from './api';

const certificateService = {
  getStatus: () => api.get('/certificates/status'),

  download: (clearanceId) =>
    api.get(`/certificates/${clearanceId}/download`, { responseType: 'blob' }),
};

export default certificateService;