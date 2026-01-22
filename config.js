// Frontend Configuration and API Connection
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    // Helper method for API calls
    async request(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, options);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth Methods
    register(username, email, password, userType = 'donor') {
        return this.request('/api/auth/register', 'POST', {
            username,
            email,
            password,
            userType
        });
    }

    login(email, password) {
        return this.request('/api/auth/login', 'POST', {
            email,
            password
        });
    }

    // Donation Methods
    createDonation(data) {
        return this.request('/api/donations', 'POST', data);
    }

    getDonation(donationId) {
        return this.request(`/api/donations/${donationId}`);
    }

    getCampaignDonations(campaignId) {
        return this.request(`/api/donations/campaign/${campaignId}`);
    }

    // Campaign Methods
    createCampaign(data) {
        return this.request('/api/campaigns', 'POST', data);
    }

    getCampaigns() {
        return this.request('/api/campaigns');
    }

    getCampaign(campaignId) {
        return this.request(`/api/campaigns/${campaignId}`);
    }

    updateCampaign(campaignId, data) {
        return this.request(`/api/campaigns/${campaignId}`, 'PUT', data);
    }

    // Event Methods
    createEvent(data) {
        return this.request('/api/events', 'POST', data);
    }

    getEvents() {
        return this.request('/api/events');
    }

    attendEvent(eventId, userId) {
        return this.request(`/api/events/${eventId}/attend`, 'POST', { userId });
    }

    // Hospital Methods
    registerHospital(data) {
        return this.request('/api/hospitals', 'POST', data);
    }

    getHospitals() {
        return this.request('/api/hospitals');
    }

    // Stats Methods
    getStats() {
        return this.request('/api/stats');
    }
}

// Create global API client instance
const api = new APIClient();

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-CM', {
        style: 'currency',
        currency: 'XAF'
    }).format(amount);
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

class RateLimiter {
    constructor() {
        this.limits = {};
    }

    checkLimit(key, maxAttempts = 5, timeWindowMs = 60000) {
        const now = Date.now();
        
        if (!this.limits[key]) {
            this.limits[key] = [];
        }

        // Remove old attempts outside the time window
        this.limits[key] = this.limits[key].filter(time => now - time < timeWindowMs);

        if (this.limits[key].length >= maxAttempts) {
            return false;
        }

        this.limits[key].push(now);
        return true;
    }

    getRemainingTime(key, timeWindowMs = 60000) {
        const now = Date.now();
        if (!this.limits[key] || this.limits[key].length === 0) return 0;
        
        const oldestAttempt = this.limits[key][0];
        const remaining = Math.ceil((timeWindowMs - (now - oldestAttempt)) / 1000);
        return Math.max(0, remaining);
    }
}

const rateLimiter = new RateLimiter();

function showAlert(message, type = 'info') {
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 15px 20px;
        border-radius: 4px;
        animation: slideIn 0.3s ease-in-out;
    `;

    if (type === 'error') {
        alertBox.style.backgroundColor = '#f8d7da';
        alertBox.style.color = '#721c24';
        alertBox.style.border = '1px solid #f5c6cb';
    } else if (type === 'success') {
        alertBox.style.backgroundColor = '#d4edda';
        alertBox.style.color = '#155724';
        alertBox.style.border = '1px solid #c3e6cb';
    }

    document.body.appendChild(alertBox);

    setTimeout(() => alertBox.remove(), 5000);
}

function getCampaignById(campaignId) {
    // This would be replaced with actual API call
    // For now, returns a demo campaign
    return {
        id: campaignId,
        patientName: 'John Doe',
        story: 'Help us support cancer treatment'
    };
}
