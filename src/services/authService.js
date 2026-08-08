import api from './api';

const authService = {
  login: (credentials) =>
    api.post('/auth/login', credentials),

  register: (data) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),

  verifyEmail: (code) =>
    api.post('/auth/verify-email', { code }),

  resendVerification: (email) =>
    api.post('/auth/resend-verification', { email }),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),
};

export default authService;