import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('etherballot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('etherballot_token');
      localStorage.removeItem('etherballot_user');
      // Don't redirect if already on login/register page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════
//  AUTH API
// ═══════════════════════════════════════════

export const authAPI = {
  validateAadhaar: (aadhaarNumber) => 
    api.post('/auth/validate-aadhaar', { aadhaarNumber }),
  
  sendOTP: (mobile) => 
    api.post('/auth/send-otp', { mobile }),
  
  verifyOTP: (mobile, otp) => 
    api.post('/auth/verify-otp', { mobile, otp }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  login: (aadhaarNumber) => 
    api.post('/auth/login', { aadhaarNumber }),
  
  verifyFace: (userId, faceDescriptor) => 
    api.post('/auth/login/verify-face', { userId, faceDescriptor }),
  
  getMe: () => 
    api.get('/auth/me')
};

// ═══════════════════════════════════════════
//  ADMIN API
// ═══════════════════════════════════════════

export const adminAPI = {
  login: (username, password) => 
    api.post('/admin/login', { username, password }),
  
  createStateAdmin: (data) => 
    api.post('/admin/create-state-admin', data),
  
  createDistrictAdmin: (data) => 
    api.post('/admin/create-district-admin', data),
  
  listAdmins: (params) => 
    api.get('/admin/list', { params }),
  
  toggleAdminStatus: (id) => 
    api.put(`/admin/${id}/toggle-status`),
  
  getStats: () => 
    api.get('/admin/stats'),
  
  getVoters: (params) => 
    api.get('/admin/voters', { params }),
  
  getAuditLogs: (params) => 
    api.get('/admin/audit-logs', { params }),
  
  getStates: () => 
    api.get('/admin/states'),

  deleteVoter: (id) => 
    api.delete(`/admin/voters/${id}`)
};

// ═══════════════════════════════════════════
//  ELECTION API
// ═══════════════════════════════════════════

export const electionAPI = {
  create: (data) => 
    api.post('/elections', data),
  
  getAll: (params) => 
    api.get('/elections', { params }),
  
  getActive: () => 
    api.get('/elections/active'),
  
  getById: (id) => 
    api.get(`/elections/${id}`),
  
  updateStatus: (id, status) => 
    api.put(`/elections/${id}/status`, { status }),
  
  getResults: (id) => 
    api.get(`/elections/${id}/results`)
};

// ═══════════════════════════════════════════
//  VOTING API
// ═══════════════════════════════════════════

export const votingAPI = {
  castVote: (electionId, candidateIndex) => 
    api.post('/voting/cast', { electionId, candidateIndex }),
  
  checkStatus: (electionId) => 
    api.get(`/voting/status/${electionId}`),
  
  getEligibleElections: () => 
    api.get('/voting/eligible-elections'),
  
  verifyVote: (voteHash) => 
    api.post('/voting/verify', { voteHash })
};

export default api;
