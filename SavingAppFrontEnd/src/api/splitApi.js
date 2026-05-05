import api from './axios'

export const splitApi = {
  // Friends
  sendFriendRequest: (email) =>
    api.post(`/friends/request?email=${email}`),
  respondToRequest: (id, accept) =>
    api.put(`/friends/request/${id}/respond?accept=${accept}`),
  getMyFriends: () => api.get('/friends'),
  getPendingRequests: () => api.get('/friends/pending'),

  // Groups
  createGroup: (data) => api.post('/split/groups', data),
  getMyGroups: () => api.get('/split/groups'),
  getGroupById: (id) => api.get(`/split/groups/${id}`),
  addMember: (groupId, userId) =>
    api.post(`/split/groups/${groupId}/members?userId=${userId}`),
  deleteGroup: (id) => api.delete(`/split/groups/${id}`),

  // Expenses
  addExpense: (data) => api.post('/split/expenses', data),
  getGroupExpenses: (groupId) =>
    api.get(`/split/groups/${groupId}/expenses`),
  getGroupBalances: (groupId) =>
    api.get(`/split/groups/${groupId}/balances`),
  settleUp: (groupId, userId) =>
    api.post(`/split/groups/${groupId}/settle/${userId}`),
}