/**
 * Smart Library Management System - API Client Service
 */

const API_BASE = '/api';

const API = {
  // Token Management
  getToken() {
    return localStorage.getItem('slms_token');
  },
  setToken(token) {
    if (token) {
      localStorage.setItem('slms_token', token);
    } else {
      localStorage.removeItem('slms_token');
    }
  },
  getCurrentUser() {
    const userStr = localStorage.getItem('slms_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('slms_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('slms_user');
    }
  },

  // Centralized HTTP Request Dispatcher
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          this.setToken(null);
          this.setCurrentUser(null);
          window.location.hash = '#auth';
        }
        throw new Error(data.message || 'API request failed');
      }

      return data.data !== undefined ? data.data : data;
    } catch (err) {
      console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  },

  // Auth Endpoints
  auth: {
    login(credentials) {
      return API.request('/auth/login', { method: 'POST', body: credentials });
    },
    register(payload) {
      return API.request('/auth/register', { method: 'POST', body: payload });
    },
    getMe() {
      return API.request('/auth/me');
    }
  },

  // Books & Catalog Endpoints
  books: {
    getAll() {
      return API.request('/books');
    },
    getById(id) {
      return API.request(`/books/${id}`);
    },
    search(query = '', category = '') {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (category) params.append('category', category);
      return API.request(`/books/search?${params.toString()}`);
    },
    getCategories() {
      return API.request('/books/categories');
    },
    create(bookData) {
      return API.request('/books', { method: 'POST', body: bookData });
    },
    update(id, bookData) {
      return API.request(`/books/${id}`, { method: 'PUT', body: bookData });
    },
    delete(id) {
      return API.request(`/books/${id}`, { method: 'DELETE' });
    },
    getCopies(id) {
      return API.request(`/books/${id}/copies`);
    },
    addCopy(id, copyData) {
      return API.request(`/books/${id}/copies`, { method: 'POST', body: copyData });
    },
    updateCopyStatus(copyId, status) {
      return API.request(`/books/copies/${copyId}/status`, { method: 'PATCH', body: { status } });
    }
  },

  // Members Management Endpoints
  members: {
    getAll() {
      return API.request('/members');
    },
    getById(id) {
      return API.request(`/members/${id}`);
    },
    search(query) {
      return API.request(`/members/search?query=${encodeURIComponent(query)}`);
    },
    update(id, memberData) {
      return API.request(`/members/${id}`, { method: 'PUT', body: memberData });
    },
    updateStatus(id, status) {
      return API.request(`/members/${id}/status`, { method: 'PATCH', body: { status } });
    },
    toggleActive(id) {
      return API.request(`/members/${id}/toggle-active`, { method: 'PATCH' });
    },
    getHistory(id) {
      return API.request(`/members/${id}/history`);
    }
  },

  // Circulation / Loans Endpoints
  loans: {
    issue(loanData) {
      return API.request('/loans/issue', { method: 'POST', body: loanData });
    },
    returnBook(returnData) {
      return API.request('/loans/return', { method: 'POST', body: returnData });
    },
    getAll() {
      return API.request('/loans');
    },
    getActive() {
      return API.request('/loans/active');
    },
    getOverdue() {
      return API.request('/loans/overdue');
    },
    getMemberLoans(memberId) {
      return API.request(`/loans/member/${memberId}`);
    },
    filter(status = '', startDate = '', endDate = '') {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      return API.request(`/loans/filter?${params.toString()}`);
    }
  },

  // Reservations Endpoints
  reservations: {
    create(resData) {
      return API.request('/reservations', { method: 'POST', body: resData });
    },
    getAll() {
      return API.request('/reservations');
    },
    getMemberReservations(memberId) {
      return API.request(`/reservations/member/${memberId}`);
    },
    cancel(id) {
      return API.request(`/reservations/${id}`, { method: 'DELETE' });
    },
    fulfill(id) {
      return API.request(`/reservations/${id}/fulfill`, { method: 'POST' });
    }
  },

  // Fines & Payments Endpoints
  fines: {
    getAll() {
      return API.request('/fines');
    },
    getMemberFines(memberId) {
      return API.request(`/fines/member/${memberId}`);
    },
    getUnpaid(memberId) {
      return API.request(`/fines/member/${memberId}/unpaid`);
    },
    pay(paymentData) {
      return API.request('/fines/pay', { method: 'POST', body: paymentData });
    },
    waive(id, reason) {
      return API.request(`/fines/${id}/waive`, { method: 'POST', body: { reason } });
    },
    getPayments() {
      return API.request('/fines/payments');
    },
    getMemberPayments(memberId) {
      return API.request(`/fines/payments/member/${memberId}`);
    }
  },

  // Reports Endpoints
  reports: {
    getInventory() {
      return API.request('/reports/inventory');
    },
    getBorrowingHistory(startDate, endDate) {
      const p = new URLSearchParams();
      if (startDate) p.append('startDate', startDate);
      if (endDate) p.append('endDate', endDate);
      return API.request(`/reports/borrowing-history?${p.toString()}`);
    },
    getOverdue() {
      return API.request('/reports/overdue');
    },
    getActiveMembers() {
      return API.request('/reports/active-members');
    },
    getFineCollection(startDate, endDate) {
      const p = new URLSearchParams();
      if (startDate) p.append('startDate', startDate);
      if (endDate) p.append('endDate', endDate);
      return API.request(`/reports/fine-collection?${p.toString()}`);
    },
    getMostBorrowed() {
      return API.request('/reports/most-borrowed');
    }
  },

  // Dashboard Endpoints
  dashboard: {
    getLibrarianStats() {
      return API.request('/dashboard/librarian');
    },
    getMemberStats(memberId) {
      return API.request(`/dashboard/member/${memberId}`);
    }
  },

  // Notifications Endpoints
  notifications: {
    getAll() {
      return API.request('/notifications');
    },
    getUnreadCount() {
      return API.request('/notifications/unread-count');
    },
    markRead(id) {
      return API.request(`/notifications/${id}/read`, { method: 'PATCH' });
    },
    markAllRead() {
      return API.request('/notifications/mark-all-read', { method: 'PATCH' });
    }
  }
};
