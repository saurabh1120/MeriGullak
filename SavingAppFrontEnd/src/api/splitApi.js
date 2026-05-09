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
  updateExpense: (id, data) =>
    api.put(`/split/expenses/${id}`, data),
  deleteExpense: (id) =>
    api.delete(`/split/expenses/${id}`),
  getGroupExpenses: (groupId) =>
    api.get(`/split/groups/${groupId}/expenses`),

  // Balances
  getGroupBalances: (groupId) =>
    api.get(`/split/groups/${groupId}/balances`),

  // History — expenses + cash payments combined
  getGroupHistory: (groupId) =>
    api.get(`/split/groups/${groupId}/history`),

  // Settle
  settleUp: (groupId, userId) =>
    api.post(`/split/groups/${groupId}/settle/${userId}`),
  partialSettle: (groupId, userId, amount) =>
    api.post(
      `/split/groups/${groupId}/settle/${userId}/partial`,
      null,
      { params: { amount } }
    ),
}
