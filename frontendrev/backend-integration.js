/**
 * Frontend Integration with Backend
 * Handles all API calls and authentication
 */

// Import or include the API client (api-client.js should be loaded first)
// <script src="api-client.js"></script>

/**
 * Authentication Management
 */

class AuthManager {
  static async register(userData) {
    try {
      const response = await apiClient.registerUser({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        accountType: userData.accountType, // 'donor' or 'patient'
      });

      // Store user data and token
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      apiClient.setAuthToken(response.token);

      showAlert('Registration successful!', 'success');
      return response;
    } catch (error) {
      showAlert(error.message || 'Registration failed', 'danger');
      throw error;
    }
  }

  static async login(email, password) {
    try {
      const response = await apiClient.loginUser(email, password);

      // Store user data and token
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      apiClient.setAuthToken(response.token);

      showAlert('Login successful!', 'success');
      return response;
    } catch (error) {
      showAlert(error.message || 'Login failed', 'danger');
      throw error;
    }
  }

  static logout() {
    localStorage.removeItem('currentUser');
    apiClient.clearAuthToken();
    showAlert('Logged out successfully', 'info');
    window.location.href = 'login.html';
  }

  static getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  static isAuthenticated() {
    return apiClient.isAuthenticated() || !!this.getCurrentUser();
  }
}

/**
 * Campaign Management
 */

class CampaignManager {
  static async createCampaign(campaignData) {
    try {
      const response = await apiClient.createCampaign(campaignData);
      showAlert('Campaign created successfully!', 'success');
      return response;
    } catch (error) {
      showAlert(error.message || 'Failed to create campaign', 'danger');
      throw error;
    }
  }

  static async getCampaigns() {
    try {
      return await apiClient.getCampaigns();
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      return [];
    }
  }

  static async getCampaignById(id) {
    try {
      return await apiClient.getCampaignById(id);
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
      return null;
    }
  }

  static async updateCampaign(id, campaignData) {
    try {
      const response = await apiClient.updateCampaign(id, campaignData);
      showAlert('Campaign updated successfully!', 'success');
      return response;
    } catch (error) {
      showAlert(error.message || 'Failed to update campaign', 'danger');
      throw error;
    }
  }

  static async deleteCampaign(id) {
    try {
      const response = await apiClient.deleteCampaign(id);
      showAlert('Campaign deleted successfully!', 'success');
      return response;
    } catch (error) {
      showAlert(error.message || 'Failed to delete campaign', 'danger');
      throw error;
    }
  }
}

/**
 * Donation Management
 */

class DonationManager {
  static async createDonation(donationData) {
    try {
      if (!apiClient.isAuthenticated()) {
        showAlert('Please login to make a donation', 'warning');
        window.location.href = 'login.html';
        return;
      }

      const response = await apiClient.createDonation(donationData);

      if (donationData.paymentMethod === 'mtn') {
        // Show MTN payment initiated message
        showAlert('MTN payment initiated. Please confirm on your phone.', 'info');

        // Start polling payment status
        this.pollMTNPaymentStatus(response.donation.id);
      } else {
        showAlert('Donation created. Please complete payment.', 'success');
      }

      return response;
    } catch (error) {
      showAlert(error.message || 'Failed to create donation', 'danger');
      throw error;
    }
  }

  static async checkMTNPaymentStatus(donationId) {
    try {
      const response = await apiClient.checkMTNPaymentStatus(donationId);
      return response;
    } catch (error) {
      console.error('Failed to check payment status:', error);
      return null;
    }
  }

  static async pollMTNPaymentStatus(donationId, attempts = 0, maxAttempts = 30) {
    // Poll for 5 minutes with 10-second intervals
    if (attempts >= maxAttempts) {
      showAlert('Payment confirmation timeout. Please check your account.', 'warning');
      return;
    }

    setTimeout(async () => {
      const status = await this.checkMTNPaymentStatus(donationId);

      if (status && status.status === 'success') {
        showAlert('Payment successful! Thank you for your donation.', 'success');
      } else if (status && status.status === 'failed') {
        showAlert('Payment failed. Please try again.', 'danger');
      } else {
        // Continue polling
        this.pollMTNPaymentStatus(donationId, attempts + 1, maxAttempts);
      }
    }, 10000); // Check every 10 seconds
  }

  static async getDonationsByCampaign(campaignId) {
    try {
      return await apiClient.getCampaignDonations(campaignId);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
      return [];
    }
  }
}

/**
 * Helper Functions
 */

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
}

function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function validatePhoneNumber(phoneNumber) {
  // Simple validation for phone numbers
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  return cleaned.length >= 9;
}

function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.marginBottom = '20px';

  const container = document.querySelector('.container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

/**
 * Form Handlers
 */

function setupAuthForms() {
  // Handle registration form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const accountType = document.getElementById('accountType').value;

      // Validation
      if (!fullName || !email || !phone || !password) {
        showAlert('Please fill in all required fields', 'warning');
        return;
      }

      if (!validateEmail(email)) {
        showAlert('Please enter a valid email address', 'warning');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'warning');
        return;
      }

      if (password.length < 8) {
        showAlert('Password must be at least 8 characters long', 'warning');
        return;
      }

      try {
        await AuthManager.register({
          fullName: sanitizeInput(fullName),
          email: sanitizeInput(email),
          phone: sanitizeInput(phone),
          password,
          accountType,
        });

        // Redirect after successful registration
        setTimeout(() => {
          window.location.href = 'donor-dashboard.html';
        }, 1500);
      } catch (error) {
        console.error('Registration error:', error);
      }
    });
  }

  // Handle login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showAlert('Please enter email and password', 'warning');
        return;
      }

      try {
        await AuthManager.login(email, password);

        // Redirect based on account type
        const user = AuthManager.getCurrentUser();
        const redirectUrl = user.accountType === 'patient' 
          ? 'patient-dashboard.html'
          : 'donor-dashboard.html';

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1500);
      } catch (error) {
        console.error('Login error:', error);
      }
    });
  }
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  setupAuthForms();

  // Check authentication on protected pages
  const protectedPages = [
    'donor-dashboard.html',
    'patient-dashboard.html',
    'hospital-dashboard.html',
  ];

  const currentPage = window.location.pathname.split('/').pop();
  if (protectedPages.some((page) => currentPage.includes(page))) {
    if (!AuthManager.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  }
});

// Make managers globally available
window.AuthManager = AuthManager;
window.CampaignManager = CampaignManager;
window.DonationManager = DonationManager;
