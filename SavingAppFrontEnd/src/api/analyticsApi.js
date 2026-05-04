import api from './axios'

export const analyticsApi = {
  get: (month, year) => api.get(`/analytics?month=${month}&year=${year}`),
}