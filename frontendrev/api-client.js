/**
 * API Client for CancerCare Backend
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = 'https://crowdfunding-webapp.onrender.com/api';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Get authorization headers
   */
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  async request(method, endpoint, data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async registerUser(userData) {
    return this.request('POST', '/auth/register', userData);
  }

  async loginUser(email, password) {
    return this.request('POST', '/auth/login', { email, password });
  }

  async registerHospital(hospitalData) {
    return this.request('POST', '/auth/hospital/register', hospitalData);
  }

  async loginHospital(adminEmail, password) {
    return this.request('POST', '/auth/hospital/login', { adminEmail, password });
  }

  // Campaign endpoints
  async createCampaign(campaignData) {
    return this.request('POST', '/campaigns', campaignData);
  }

  async getCampaigns() {
    return this.request('GET', '/campaigns');
  }

  async getCampaignById(id) {
    return this.request('GET', `/campaigns/${id}`);
  }

  async updateCampaign(id, campaignData) {
    return this.request('PUT', `/campaigns/${id}`, campaignData);
  }

  async deleteCampaign(id) {
    return this.request('DELETE', `/campaigns/${id}`);
  }

  // Donation endpoints
  async createDonation(donationData) {
    return this.request('POST', '/donations', donationData);
  }

  async getDonation(id) {
    return this.request('GET', `/donations/${id}`);
  }

  async getCampaignDonations(campaignId) {
    return this.request('GET', `/donations/campaign/${campaignId}`);
  }

  async checkMTNPaymentStatus(donationId) {
    return this.request('GET', `/donations/${donationId}/mtn-status`);
  }

  // Event endpoints
  async createEvent(eventData) {
    return this.request('POST', '/events', eventData);
  }

  async getEvents() {
    return this.request('GET', '/events');
  }

  async updateEvent(id, eventData) {
    return this.request('PUT', `/events/${id}`, eventData);
  }

  async deleteEvent(id) {
    return this.request('DELETE', `/events/${id}`);
  }

  // Verification request endpoints
  async createVerificationRequest(requestData) {
    return this.request('POST', '/verification-requests', requestData);
  }

  async getVerificationRequests() {
    return this.request('GET', '/verification-requests');
  }

  async approveVerificationRequest(id) {
    return this.request('POST', `/verification-requests/${id}/approve`);
  }

  async rejectVerificationRequest(id) {
    return this.request('POST', `/verification-requests/${id}/reject`);
  }

  /**
   * Set auth token after login
   */
  setAuthToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  /**
   * Clear auth token on logout
   */
  clearAuthToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }
}

// Create global instance
const apiClient = new APIClient();

// Make available globally
window.apiClient = apiClient;
