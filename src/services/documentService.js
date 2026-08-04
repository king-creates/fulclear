import api from './api';

const documentService = {
  upload: (file, documentType, clearanceId, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (clearanceId) formData.append('clearanceId', clearanceId);

    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) {
          const pct = Math.round((e.loaded * 100) / e.total);
          onProgress(pct);
        }
      },
    });
  },

  getMyDocuments: () => api.get('/documents/my'),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  downloadDocument: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  viewDocument: (id) => api.get(`/documents/${id}/view`, { responseType: 'blob' }),
  getDocumentsByStudent: (studentId) => api.get(`/documents/student/${studentId}`),
};

export default documentService;