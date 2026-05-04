import api from './axios'

export const expenseApi = {
  getAll: () => api.get('/expenses'),
  getByAccount: (accountId) => api.get(`/expenses/account/${accountId}`),
  getByDateRange: (start, end) => api.get(`/expenses/range?start=${start}&end=${end}`),
  add: (data) => api.post('/expenses', data),
  delete: (id) => api.delete(`/expenses/${id}`),
}