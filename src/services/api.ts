import axios from 'axios';

// Determine API base URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? (process.env.REACT_APP_API_URL || 'https://da-tog-updated-backend.onrender.com/api')
  : 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Could redirect to login page here
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),

  // Dashboard endpoints
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getEmployeeDashboard: () => api.get('/dashboard/employee'),

  // Customer endpoints
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomer: (id) => api.get(`/customers/${id}`),
  createCustomer: (customer) => api.post('/customers', customer),
  updateCustomer: (id, customer) => api.put(`/customers/${id}`, customer),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
  searchCustomers: (query) => api.get(`/customers/search?q=${encodeURIComponent(query)}`),
  getCustomerStats: () => api.get('/customers/stats'),
  getCustomerOrders: (id) => api.get(`/customers/${id}/orders`),

  // Order endpoints
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (order) => api.post('/orders', order),
  updateOrder: (id, order) => api.put(`/orders/${id}`, order),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  addOrderPayment: (id, payment) => api.post(`/orders/${id}/payment`, payment),

  // Employee endpoints (admin only)
  getEmployees: (params) => api.get('/employees', { params }),
  getEmployee: (id) => api.get(`/employees/${id}`),
  createEmployee: (employee) => api.post('/employees', employee),
  updateEmployee: (id, employee) => api.put(`/employees/${id}`, employee),
  deactivateEmployee: (id) => api.delete(`/employees/${id}`),
  updateEmployeePermissions: (id, permissions) => api.patch(`/employees/${id}/permissions`, { permissions }),
  getEmployeeStats: () => api.get('/employees/stats'),

  // Fabric endpoints
  getFabrics: (params) => api.get('/fabrics', { params }),
  getFabric: (id) => api.get(`/fabrics/${id}`),
  createFabric: (fabric) => api.post('/fabrics', fabric),
  updateFabric: (id, fabric) => api.put(`/fabrics/${id}`, fabric),
  deleteFabric: (id) => api.delete(`/fabrics/${id}`),
  addFabricStock: (id, payload) => api.post(`/fabrics/${id}/add-stock`, payload),
  getLowStockFabrics: () => api.get('/fabrics/low-stock'),
  getFabricStats: () => api.get('/fabrics/stats'),

  // Measurement endpoints
  getMeasurements: (params) => api.get('/measurements', { params }),
  getMeasurement: (id) => api.get(`/measurements/${id}`),
  createMeasurement: (measurement) => api.post('/measurements', measurement),
  updateMeasurement: (id, measurement) => api.put(`/measurements/${id}`, measurement),
  deleteMeasurement: (id) => api.delete(`/measurements/${id}`),

  // Job Card endpoints
  getJobCards: (params) => api.get('/jobcards', { params }),
  getJobCard: (id) => api.get(`/jobcards/${id}`),
  createJobCard: (jobCard) => api.post('/jobcards', jobCard),
  updateJobCardStatus: (id, status) => api.patch(`/jobcards/${id}/status`, { status }),
  addJobCardProgress: (id, progress) => api.post(`/jobcards/${id}/progress`, progress),
  uploadJobCardImage: (id, payload) => api.post(`/jobcards/${id}/images`, payload),
  getMyJobCards: (params) => api.get('/jobcards/my-jobs', { params }),
  getJobCardPDF: (id) => api.get(`/jobcards/${id}/pdf`, { responseType: 'blob' }),
  getJobCardStats: () => api.get('/jobcards/stats'),
  generateJobCardsFromOrder: (orderId, payload) => api.post(`/jobcards/generate-from-order/${orderId}`, payload),

  // Invoice endpoints
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  createInvoice: (invoice) => api.post('/invoices', invoice),
  updateInvoice: (id, invoice) => api.put(`/invoices/${id}`, invoice),
  updateInvoicePayment: (id, payment) => api.post(`/invoices/${id}/payment`, payment),
  generateInvoiceFromOrder: (orderId, payload) => api.post(`/invoices/generate/${orderId}`, payload),
  getInvoicePDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),

  // Notification endpoints
  getNotifications: (params) => api.get('/notifications', { params }),
  getNotificationCounts: () => api.get('/notifications/counts'),
  getNotificationStats: (period) => api.get('/notifications/stats', { params: { period } }),
  markNotificationsAsRead: (notificationIds) => api.patch('/notifications/mark-read', { notificationIds }),
  markAllNotificationsAsRead: () => api.patch('/notifications/mark-all-read'),
  sendTestNotification: () => api.post('/notifications/test'),
  cleanupOldNotifications: (days) => api.delete('/notifications/cleanup', { params: { days } }),

  // Admin notification broadcasting
  sendBroadcastNotification: (notificationData) => api.post('/notifications/broadcast', notificationData),
  getNotificationTemplates: () => api.get('/notifications/templates'),
  createNotificationTemplate: (template) => api.post('/notifications/templates', template),
  updateNotificationTemplate: (id, template) => api.put(`/notifications/templates/${id}`, template),
  deleteNotificationTemplate: (id) => api.delete(`/notifications/templates/${id}`),

  // Settings endpoints
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', settings),
  resetSettings: () => api.post('/settings/reset'),
  exportData: () => api.get('/settings/export'),
  importData: (data) => api.post('/settings/import', data),
  clearAllData: () => api.delete('/settings/clear-all'),
  getSystemInfo: () => api.get('/settings/system-info'),
};

export default api;