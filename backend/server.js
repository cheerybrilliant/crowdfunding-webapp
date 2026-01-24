/**
 * CancerCare Donations Backend Server
 * Handles MTN Payment Processing and Donation Management
 * 
 * Setup: npm install express dotenv axios cors
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
    credentials: true
}));

// Basic health checks for Render and uptime monitors
app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

// In-memory storage (replace with database in production)
const donations = new Map();
const paymentTransactions = new Map();

// ==================== MTN Payment Service ====================

class MTNPaymentProcessor {
    constructor() {
        this.baseUrl = process.env.PAYMENT_ENV === 'production' 
            ? 'https://api.mtn.com'
            : 'https://sandbox.momodeveloper.mtn.com';
        
        this.config = {
            apiKey: process.env.MTN_API_KEY,
            apiSecret: process.env.MTN_API_SECRET,
            subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY,
            primaryKey: process.env.MTN_PRIMARY_KEY,
            businessPartnerId: process.env.MTN_BUSINESS_PARTNER_ID,
            businessPartnerPin: process.env.MTN_BUSINESS_PARTNER_PIN,
        };

        // Validate configuration
        this.validateConfig();
    }

    validateConfig() {
        const requiredKeys = ['apiKey', 'subscriptionKey', 'businessPartnerId'];
        for (const key of requiredKeys) {
            if (!this.config[key] || this.config[key].includes('your_')) {
                console.warn(`⚠️  Missing or invalid MTN config: ${key}`);
            }
        }
    }

    /**
     * Initiate payment request with MTN API
     */
    async initiatePayment(paymentData) {
        try {
            const requestId = uuidv4();
            
            const paymentPayload = {
                payerMessage: paymentData.payerMessage,
                currencyCode: 'XAF',
                amount: paymentData.amount.toString(),
                transactionReference: paymentData.transactionReference,
                subscriberNumber: paymentData.phoneNumber,
                externalId: requestId,
                callbackUrl: `${process.env.BASE_URL}/api/payment/callback`
            };

            const headers = {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'X-Reference-Id': requestId,
                'X-Target-Environment': process.env.PAYMENT_ENV || 'sandbox',
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': this.config.subscriptionKey
            };

            const response = await axios.post(
                `${this.baseUrl}/collection/v1_0/requesttopay`,
                paymentPayload,
                { headers }
            );

            // Store transaction
            paymentTransactions.set(requestId, {
                requestId,
                ...paymentData,
                status: 'INITIATED',
                initiatedAt: new Date(),
                headers
            });

            return {
                success: true,
                requestId,
                message: 'Payment request initiated successfully'
            };

        } catch (error) {
            console.error('MTN API Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                code: 'MTN_API_ERROR'
            };
        }
    }

    /**
     * Check payment status with MTN API
     */
    async checkPaymentStatus(requestId) {
        try {
            const transaction = paymentTransactions.get(requestId);
            
            if (!transaction) {
                return {
                    success: false,
                    error: 'Transaction not found',
                    code: 'TRANSACTION_NOT_FOUND'
                };
            }

            const headers = {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'X-Reference-Id': requestId,
                'X-Target-Environment': process.env.PAYMENT_ENV || 'sandbox',
                'Ocp-Apim-Subscription-Key': this.config.subscriptionKey
            };

            const response = await axios.get(
                `${this.baseUrl}/collection/v1_0/requesttopay/${requestId}`,
                { headers }
            );

            const status = response.data.status;
            
            // Update transaction status
            transaction.status = status;
            transaction.lastChecked = new Date();

            return {
                success: true,
                status: status,
                transactionId: response.data.transactionId,
                data: response.data
            };

        } catch (error) {
            console.error('Status check error:', error.message);
            return {
                success: false,
                error: error.message,
                code: 'STATUS_CHECK_FAILED'
            };
        }
    }

    /**
     * Get transaction details
     */
    getTransaction(requestId) {
        return paymentTransactions.get(requestId);
    }
}

// Initialize MTN Processor
const mtnProcessor = new MTNPaymentProcessor();

// ==================== API Routes ====================

/**
 * POST /api/payments/initiate
 * Initiate a new payment request
 */
app.post('/api/payments/initiate', async (req, res) => {
    try {
        const { amount, phoneNumber, donorName, campaignId } = req.body;

        // Validate input
        if (!amount || !phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: amount, phoneNumber'
            });
        }

        if (amount < 100) {
            return res.status(400).json({
                success: false,
                error: 'Minimum amount is 100 XAF'
            });
        }

        // Create donation record
        const donationId = uuidv4();
        const donation = {
            id: donationId,
            donorName: donorName || 'Anonymous',
            phoneNumber,
            amount,
            campaignId: campaignId || null,
            paymentMethod: 'MTN',
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };

        // Initiate MTN payment
        const paymentResult = await mtnProcessor.initiatePayment({
            amount,
            phoneNumber: formatPhoneNumber(phoneNumber),
            payerMessage: `CancerCare Donation - ${donorName || 'Anonymous'}`,
            transactionReference: donationId
        });

        if (!paymentResult.success) {
            return res.status(400).json(paymentResult);
        }

        // Store donation
        donation.mtnRequestId = paymentResult.requestId;
        donations.set(donationId, donation);

        res.json({
            success: true,
            donationId,
            requestId: paymentResult.requestId,
            message: 'Payment request sent to customer'
        });

    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/payments/:requestId/status
 * Check payment status
 */
app.get('/api/payments/:requestId/status', async (req, res) => {
    try {
        const { requestId } = req.params;
        
        const statusResult = await mtnProcessor.checkPaymentStatus(requestId);
        
        if (!statusResult.success) {
            return res.status(404).json(statusResult);
        }

        // Find corresponding donation
        let donation = null;
        for (const [, d] of donations) {
            if (d.mtnRequestId === requestId) {
                donation = d;
                // Update donation status
                if (statusResult.status === 'SUCCESS') {
                    d.status = 'COMPLETED';
                    d.completedAt = new Date().toISOString();
                } else if (statusResult.status === 'FAILED') {
                    d.status = 'FAILED';
                }
                break;
            }
        }

        res.json({
            success: true,
            status: statusResult.status,
            donation: donation,
            details: statusResult.data
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/donations
 * Create a donation record (called after successful payment)
 */
app.post('/api/donations', (req, res) => {
    try {
        const { mtnRequestId, amount, phoneNumber, donorName, campaignId } = req.body;

        if (!mtnRequestId) {
            return res.status(400).json({
                success: false,
                error: 'Missing mtnRequestId'
            });
        }

        const donationId = uuidv4();
        const donation = {
            id: donationId,
            mtnRequestId,
            amount,
            phoneNumber: maskPhoneNumber(phoneNumber),
            donorName: donorName || 'Anonymous',
            campaignId: campaignId || null,
            status: 'CONFIRMED',
            createdAt: new Date().toISOString()
        };

        donations.set(donationId, donation);

        res.status(201).json({
            success: true,
            donationId,
            message: 'Donation recorded successfully'
        });

    } catch (error) {
        console.error('Create donation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/donations/:donationId
 * Get donation details
 */
app.get('/api/donations/:donationId', (req, res) => {
    try {
        const { donationId } = req.params;
        const donation = donations.get(donationId);

        if (!donation) {
            return res.status(404).json({
                success: false,
                error: 'Donation not found'
            });
        }

        // Don't expose full phone number
        const safeDonation = { ...donation };
        delete safeDonation.phoneNumber;

        res.json({
            success: true,
            donation: safeDonation
        });

    } catch (error) {
        console.error('Get donation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/donations
 * Get all donations (admin only - add authentication in production)
 */
app.get('/api/donations', (req, res) => {
    try {
        const allDonations = Array.from(donations.values());
        
        // Calculate statistics
        const stats = {
            totalDonations: allDonations.length,
            totalAmount: allDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
            completedCount: allDonations.filter(d => d.status === 'COMPLETED').length,
            averageDonation: Math.round(
                allDonations.reduce((sum, d) => sum + (d.amount || 0), 0) / allDonations.length
            )
        };

        res.json({
            success: true,
            stats,
            donations: allDonations.map(d => ({
                ...d,
                phoneNumber: maskPhoneNumber(d.phoneNumber)
            }))
        });

    } catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/payment/callback
 * Webhook for MTN payment callbacks
 */
app.post('/api/payment/callback', (req, res) => {
    try {
        const { transactionId, status, requestId } = req.body;

        console.log('Payment callback received:', { transactionId, status, requestId });

        // Update transaction status
        const transaction = mtnProcessor.getTransaction(requestId);
        if (transaction) {
            transaction.callbackStatus = status;
            transaction.callbackReceivedAt = new Date();
        }

        // Find and update donation
        for (const [, donation] of donations) {
            if (donation.mtnRequestId === requestId) {
                if (status === 'SUCCESS') {
                    donation.status = 'COMPLETED';
                    donation.completedAt = new Date().toISOString();
                    console.log(`✅ Donation ${donation.id} completed`);
                } else if (status === 'FAILED') {
                    donation.status = 'FAILED';
                    console.log(`❌ Donation ${donation.id} failed`);
                }
                break;
            }
        }

        // Acknowledge callback
        res.json({
            success: true,
            message: 'Callback received'
        });

    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// ==================== Utility Functions ====================

function formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\s/g, '').replace(/\D/g, '');
    
    if (!cleaned.startsWith('237')) {
        cleaned = '237' + cleaned.replace(/^(237|6|2)/, '');
    }
    
    return `+${cleaned}`;
}

function maskPhoneNumber(phoneNumber) {
    if (!phoneNumber) return 'N/A';
    const lastFour = phoneNumber.slice(-4);
    return `****${lastFour}`;
}

// ==================== Server Setup ====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║   CancerCare Donations API Server          ║
    ║   Port: ${PORT}                             
    ║   Environment: ${process.env.NODE_ENV || 'development'}          
    ║   Payment Mode: ${process.env.PAYMENT_ENV || 'sandbox'}              
    ╚════════════════════════════════════════════╝
    `);
    
    if (process.env.MTN_API_KEY && process.env.MTN_API_KEY.includes('your_')) {
        console.warn('⚠️  Warning: MTN API credentials not configured!');
        console.warn('   Please set MTN_API_KEY and other credentials in .env file');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
