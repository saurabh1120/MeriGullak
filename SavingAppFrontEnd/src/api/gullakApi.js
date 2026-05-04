import api from './axios'

export const gullakApi = {
  getAll: () => api.get('/gullaks'),
  getById: (id) => api.get(`/gullaks/${id}`),
  create: (data) => api.post('/gullaks', data),
  delete: (id) => api.delete(`/gullaks/${id}`),
  transaction: (id, data) => api.post(`/gullaks/${id}/transaction`, data),
}