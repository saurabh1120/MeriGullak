import api from './axios'

export const budgetApi = {
  getAll: () => api.get('/budgets'),
  getByMonth: (month, year) => api.get(`/budgets/month?month=${month}&year=${year}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
}