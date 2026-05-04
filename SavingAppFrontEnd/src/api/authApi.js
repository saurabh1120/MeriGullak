import api from './axios'

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
}