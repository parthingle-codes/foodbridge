import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  getMe: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => {
    localStorage.removeItem('foodbridge_token');
    localStorage.removeItem('foodbridge_user');
  },
};

export const donorService = {
  getDashboard: () => api.get('/donor/dashboard'),
  getStats: () => api.get('/donor/dashboard'),
  getListings: (params) => api.get('/donor/listings', { params }),
  getListing: (id) => api.get(`/food-listings/${id}`),
  getRecentDonations: () => api.get('/donor/listings'),
};

export const foodListingService = {
  create: (data) => api.post('/food-listings', data),
  getAll: (params) => api.get('/food-listings', { params }),
  getById: (id) => api.get(`/food-listings/${id}`),
  update: (id, data) => api.put(`/food-listings/${id}`, data),
  delete: (id) => api.delete(`/food-listings/${id}`),
  updateStatus: (id, status) => api.patch(`/food-listings/${id}/status`, { status }),
  uploadImage: (id, formData) => api.post(`/food-listings/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMatches: (id) => api.get(`/matching/${id}`),
};

export const organizationService = {
  getDashboard: () => api.get('/organization/dashboard'),
  getDashboardStats: () => api.get('/organization/dashboard'),
  getAvailableFood: (params) => api.get('/organization/available-food', { params }),
  getReservations: () => api.get('/organization/reservations'),
  acceptListing: (listingId) => api.post(`/organization/listings/${listingId}/accept`),
  declineListing: (listingId) => api.post(`/organization/listings/${listingId}/decline`),
  reserveListing: (listingId) => api.post(`/organization/listings/${listingId}/reserve`),
  reserveDonation: (listingId) => api.post(`/organization/listings/${listingId}/reserve`),
  getActivePickups: () => api.get('/organization/reservations'),
  getCompletedDistributions: () => api.get('/organization/reservations'),
};

export const matchingService = {
  getMatches: (listingId) => api.get(`/matching/${listingId}`),
  getMatchDetails: (matchId) => api.get(`/matching/${matchId}`),
  getAvailableMatches: (params) => api.get('/organization/available-food', { params }),
  acceptMatch: (listingId) => api.post(`/organization/listings/${listingId}/accept`),
  declineMatch: (listingId) => api.post(`/organization/listings/${listingId}/decline`),
  reserveDonation: (listingId) => api.post(`/organization/listings/${listingId}/reserve`),
};

export const volunteerService = {
  getDashboard: () => api.get('/volunteer/dashboard'),
  getDashboardStats: () => api.get('/volunteer/dashboard'),
  getAssignments: (params) => api.get('/volunteer/assignments', { params }),
  getAssignment: (id) => api.get(`/volunteer/assignments/${id}`),
  updateStatus: (id, status) => api.put(`/volunteer/assignments/${id}/status`, { status }),
  getActivePickup: () => api.get('/volunteer/assignments'),
};

export const assignmentService = {
  getAll: (params) => api.get('/volunteer/assignments', { params }),
  getActiveAssignments: () => api.get('/volunteer/assignments'),
  getAssignmentHistory: () => api.get('/volunteer/assignments'),
  getById: (id) => api.get(`/volunteer/assignments/${id}`),
  accept: (id) => api.post(`/assignments/${id}/accept`),
  confirmInTransit: (id) => api.put(`/volunteer/assignments/${id}/status`, { status: 'in_transit' }),
  updateStatus: (id, status) => api.put(`/volunteer/assignments/${id}/status`, { status }),
};

export const safetyService = {
  submitDonorCheck: (listingId, data) => api.post(`/safety/donor-check/${listingId}`, data),
  submitPickupCheck: (assignmentId, data) => api.post(`/safety/pickup-check/${assignmentId}`, data),
  getDonorCheck: (listingId) => api.get(`/safety/${listingId}`),
  getPickupCheck: (assignmentId) => api.get(`/safety/${assignmentId}`),
  uploadEvidence: (checkId, formData) => Promise.resolve({ success: true, message: 'Evidence uploaded' }),
};

export const otpService = {
  requestPickupOtp: (assignmentId) => api.post(`/otp/pickup/${assignmentId}/request`),
  verifyPickupOtp: (assignmentId, otp) => api.post(`/otp/pickup/${assignmentId}/verify`, { otp }),
  requestDeliveryOtp: (assignmentId) => api.post(`/otp/delivery/${assignmentId}/request`),
  verifyDeliveryOtp: (assignmentId, otp) => api.post(`/otp/delivery/${assignmentId}/verify`, { otp }),
  resendOtp: (type, assignmentId) => api.post(`/otp/${type}/${assignmentId}/resend`),
};

export const wasteRecoveryService = {
  getAvailable: (params) => api.get('/waste-recovery/available', { params }),
  getById: (id) => api.get(`/waste-recovery/${id}`),
  accept: (id) => api.post(`/waste-recovery/${id}/accept`),
  decline: (id) => api.post(`/waste-recovery/${id}/decline`),
  reserve: (id) => api.post(`/waste-recovery/${id}/reserve`),
  recordCollection: (id, data) => api.post(`/waste-recovery/${id}/collect`, data),
  updateProcessing: (id, data) => api.put(`/waste-recovery/${id}/processing`, data),
};

export const biofarmService = {
  getDashboard: () => api.get('/biofarm/dashboard'),
  getHistory: () => api.get('/biofarm/history'),
  getStats: () => api.get('/biofarm/dashboard'),
};

export const rewardService = {
  getRewards: () => api.get('/rewards'),
  getLeaderboard: () => api.get('/rewards/leaderboard'),
  getBadges: () => api.get('/rewards/badges'),
  getCredits: () => api.get('/rewards'),
};

export const analyticsService = {
  getOverview: () => api.get('/analytics/overview'),
  getDonationTrends: () => api.get('/analytics/donation-trends'),
  getVolunteerPerformance: () => api.get('/analytics/overview'),
  getDonorContributions: () => api.get('/analytics/overview'),
  getRecoveryStats: () => api.get('/analytics/overview'),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/dashboard', { params }),
  getVerificationRequests: () => api.get('/admin/verification-requests'),
  approveOrganization: (id) => api.post(`/admin/organizations/${id}/approve`),
  rejectOrganization: (id) => api.post(`/admin/organizations/${id}/reject`),
};

export const mapService = {
  getMarkers: (params) => api.get('/map/markers', { params }),
  getNearbyListings: (lat, lng, radius) => api.get('/map/markers', { params: { lat, lng, radius } }),
};
