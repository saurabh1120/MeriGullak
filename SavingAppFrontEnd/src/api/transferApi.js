import api from './axios'

export const transferApi = {
  getAll: () => api.get('/transfers'),
  create: (data) => api.post('/transfers', data),
}