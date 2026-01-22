/**
 * MTN Payment Service
 * Handles MTN Mobile Money payment processing
 * This file can be used for both frontend and backend (Node.js) contexts
 */

class MTNPaymentService {
    constructor(config = {}) {
        // MTN API Configuration
        this.config = {
            // Replace these with your actual MTN API credentials
            apiKey: config.apiKey || process.env.MTN_API_KEY || 'YOUR_MTN_API_KEY',
            apiSecret: config.apiSecret || process.env.MTN_API_SECRET || 'YOUR_MTN_API_SECRET',
            subscriptionKey: config.subscriptionKey || process.env.MTN_SUBSCRIPTION_KEY || 'YOUR_SUBSCRIPTION_KEY',
            
            // MTN API Endpoints (adjust based on your region - Cameroon example)
            sandboxBaseUrl: 'https://sandbox.momodeveloper.mtn.com',
            productionBaseUrl: 'https://api.mtn.com',
            
            // Use sandbox for testing, production for live
            environment: config.environment || 'sandbox',
            
            // Your Business/Merchant Information
            primaryKey: config.primaryKey || process.env.MTN_PRIMARY_KEY || 'YOUR_PRIMARY_KEY',
            businessPartnerId: config.businessPartnerId || process.env.MTN_BUSINESS_PARTNER_ID || 'YOUR_BUSINESS_PARTNER_ID',
            businessPartnerPin: config.businessPartnerPin || process.env.MTN_BUSINESS_PARTNER_PIN || 'YOUR_PIN',
            
            // Currency (XAF for Cameroon)
            currency: config.currency || 'XAF',
            country: config.country || 'CM', // Cameroon code
        };
        
        this.baseUrl = this.config.environment === 'production' 
            ? this.config.productionBaseUrl 
            : this.config.sandboxBaseUrl;
    }

    /**
     * Initiates a payment request with MTN
     * @param {Object} paymentData - Payment information
     * @param {string} paymentData.phoneNumber - Customer phone number
     * @param {number} paymentData.amount - Amount in XAF
     * @param {string} paymentData.referenceId - Unique transaction ID
     * @param {string} paymentData.donorName - Name of donor
     * @param {string} paymentData.campaignId - Optional campaign ID
     */
    async initiatePayment(paymentData) {
        try {
            // Validate inputs
            if (!this.validatePhoneNumber(paymentData.phoneNumber)) {
                throw new Error('Invalid phone number format');
            }
            
            if (paymentData.amount < 100) {
                throw new Error('Minimum amount is 100 XAF');
            }

            // Generate unique request ID
            const requestId = this.generateRequestId();
            
            // Prepare payment request
            const paymentRequest = {
                payerMessage: `Donation Payment - ${paymentData.donorName || 'Anonymous'}`,
                currencyCode: this.config.currency,
                amount: paymentData.amount.toString(),
                transactionReference: paymentData.referenceId,
                subscriberNumber: this.formatPhoneNumber(paymentData.phoneNumber),
                externalId: requestId,
                supportedInterfaceTypes: ['USSD', 'WEB'],
                callbackUrl: `${this.getBaseUrl()}/payment/callback`, // Your callback URL
                accessType: 'ONLINE'
            };

            // Call MTN API
            const response = await this.callMTNAPI(
                '/collection/v1_0/requesttopay',
                'POST',
                paymentRequest,
                requestId
            );

            return {
                success: true,
                requestId: requestId,
                transactionRef: paymentData.referenceId,
                message: 'Payment request sent to customer',
                response: response
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 'PAYMENT_INITIATION_FAILED'
            };
        }
    }

    /**
     * Check the status of a payment transaction
     * @param {string} requestId - MTN request ID
     */
    async checkPaymentStatus(requestId) {
        try {
            const response = await this.callMTNAPI(
                `/collection/v1_0/requesttopay/${requestId}`,
                'GET',
                null,
                requestId
            );

            return {
                success: true,
                status: response.status, // PENDING, SUCCESS, FAILED
                transactionId: response.transactionId,
                response: response
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 'STATUS_CHECK_FAILED'
            };
        }
    }

    /**
     * Make API call to MTN
     */
    async callMTNAPI(endpoint, method, data, requestId) {
        try {
            // Build headers with authentication
            const headers = {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'X-Reference-Id': requestId,
                'X-Target-Environment': this.config.environment,
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': this.config.subscriptionKey
            };

            const url = `${this.baseUrl}${endpoint}`;

            // Make HTTP request (using fetch for browser or http for Node.js)
            const fetchOptions = {
                method: method,
                headers: headers,
                ...(data && { body: JSON.stringify(data) })
            };

            // Check if running in browser or Node.js
            const response = typeof fetch !== 'undefined' 
                ? await fetch(url, fetchOptions)
                : await this.nodeHttpRequest(url, fetchOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.status}`);
            }

            return await response.json().catch(() => ({}));

        } catch (error) {
            console.error('MTN API Error:', error);
            throw error;
        }
    }

    /**
     * Node.js HTTP request handler
     */
    async nodeHttpRequest(url, options) {
        // This would use 'http' or 'axios' module in Node.js
        // For now, returning a placeholder
        throw new Error('Node.js request not implemented. Use fetch in browser or integrate axios.');
    }

    /**
     * Validate phone number format
     */
    validatePhoneNumber(phoneNumber) {
        // Cameroon phone: 237 or 6/2 followed by digits
        const cmPattern = /^(\+237|237|6|2)\d{8,9}$/;
        return cmPattern.test(phoneNumber.replace(/\s/g, ''));
    }

    /**
     * Format phone number to international format
     */
    formatPhoneNumber(phoneNumber) {
        let cleaned = phoneNumber.replace(/\s/g, '').replace(/\D/g, '');
        
        // Add country code if missing (Cameroon: 237)
        if (!cleaned.startsWith('237')) {
            cleaned = '237' + cleaned.replace(/^(237|6|2)/, '');
        }
        
        return `+${cleaned}`;
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get base URL
     */
    getBaseUrl() {
        // Replace with your actual domain
        return typeof window !== 'undefined' 
            ? window.location.origin 
            : process.env.BASE_URL || 'https://yourdomain.com';
    }

    /**
     * Create a donation record (to be stored in database)
     */
    createDonationRecord(paymentData, requestId) {
        return {
            id: this.generateRequestId(),
            donorName: paymentData.donorName || 'Anonymous',
            phoneNumber: this.formatPhoneNumber(paymentData.phoneNumber),
            amount: paymentData.amount,
            currency: this.config.currency,
            paymentMethod: 'MTN',
            mtnRequestId: requestId,
            campaignId: paymentData.campaignId || null,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MTNPaymentService;
}
