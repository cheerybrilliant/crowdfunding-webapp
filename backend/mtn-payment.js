/**
 * Frontend MTN Payment Handler
 * Manages payment UI and interaction with MTN Payment Service
 */

let mtnPaymentService;
let currentPaymentRequest = null;

// Initialize MTN Payment Service when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMTNPayment();
});

function initializeMTNPayment() {
    // Initialize the MTN Payment Service with your credentials
    mtnPaymentService = new MTNPaymentService({
        // For frontend, credentials should be minimal and secure
        // Store sensitive data on backend only
        environment: 'sandbox', // Change to 'production' for live
        currency: 'XAF',
        country: 'CM'
    });

    // Enhanced donation form submission
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.removeEventListener('submit', originalSubmitHandler);
        donationForm.addEventListener('submit', handleMTNPaymentSubmit);
    }

    // Add dynamic payment method UI updates
    setupPaymentMethodUI();
}

function setupPaymentMethodUI() {
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updatePaymentUI(this.value);
        });
    });
}

function updatePaymentUI(paymentMethod) {
    const phoneInput = document.getElementById('phoneNumber');
    const methodInfo = document.getElementById('paymentMethodInfo') || createPaymentMethodInfo();
    
    if (paymentMethod === 'mtn') {
        phoneInput.placeholder = '6XXXXXXXX or 237...';
        methodInfo.innerHTML = `
            <div class="payment-method-details">
                <h4>MTN Mobile Money Payment</h4>
                <p>You'll receive a prompt on your MTN phone to authorize the payment.</p>
                <ul style="font-size: 0.9em; color: #666;">
                    <li>✓ No additional charges from us</li>
                    <li>✓ Secure and instant</li>
                    <li>✓ Works on all MTN lines (prepaid & postpaid)</li>
                </ul>
            </div>
        `;
        methodInfo.style.display = 'block';
    } else if (paymentMethod === 'orange') {
        phoneInput.placeholder = '6XXXXXXXX';
        methodInfo.innerHTML = `
            <div class="payment-method-details">
                <h4>Orange Money Payment</h4>
                <p>You'll receive a prompt on your Orange phone to authorize the payment.</p>
                <ul style="font-size: 0.9em; color: #666;">
                    <li>✓ No additional charges from us</li>
                    <li>✓ Secure and instant</li>
                    <li>✓ Works on all Orange lines</li>
                </ul>
            </div>
        `;
        methodInfo.style.display = 'block';
    }
}

function createPaymentMethodInfo() {
    const div = document.createElement('div');
    div.id = 'paymentMethodInfo';
    div.style.marginTop = '1rem';
    div.style.padding = '1rem';
    div.style.backgroundColor = '#e8f4f8';
    div.style.borderRadius = '5px';
    document.querySelector('.form-group').parentNode.insertBefore(div, 
        document.querySelector('.form-group').nextSibling);
    return div;
}

/**
 * Handle form submission with MTN payment
 */
async function handleMTNPaymentSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const amount = document.getElementById('amount').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const donorName = document.getElementById('donorName').value || 'Anonymous';
    const campaignId = new URLSearchParams(window.location.search).get('campaign');
    
    // Validate
    if (amount < 500) {
        showAlert('Minimum donation amount is XAF 500', 'error');
        return;
    }
    
    if (paymentMethod === 'mtn' && !mtnPaymentService.validatePhoneNumber(phoneNumber)) {
        showAlert('Please enter a valid MTN phone number', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
        if (paymentMethod === 'mtn') {
            await processMTNPayment({
                amount: parseInt(amount),
                phoneNumber: phoneNumber,
                donorName: donorName,
                campaignId: campaignId
            });
        } else if (paymentMethod === 'orange') {
            await processOrangePayment({
                amount: parseInt(amount),
                phoneNumber: phoneNumber,
                donorName: donorName,
                campaignId: campaignId
            });
        }
    } catch (error) {
        showAlert(`Payment failed: ${error.message}`, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Process MTN payment
 */
async function processMTNPayment(paymentData) {
    showAlert('Initiating MTN payment... Please wait for authorization prompt on your phone.', 'info');
    
    // Step 1: Initiate payment request
    const result = await mtnPaymentService.initiatePayment(paymentData);
    
    if (!result.success) {
        throw new Error(result.error || 'Failed to initiate payment');
    }
    
    // Store current payment request for polling
    currentPaymentRequest = {
        requestId: result.requestId,
        transactionRef: result.transactionRef,
        amount: paymentData.amount,
        donorName: paymentData.donorName,
        phoneNumber: paymentData.phoneNumber
    };
    
    // Save to localStorage for recovery if page refreshes
    localStorage.setItem('currentPayment', JSON.stringify(currentPaymentRequest));
    
    // Step 2: Poll for payment status (check every 5 seconds for 3 minutes)
    pollPaymentStatus(result.requestId, paymentData);
}

/**
 * Poll payment status from MTN
 */
async function pollPaymentStatus(requestId, paymentData, attempts = 0, maxAttempts = 36) {
    const pollInterval = 5000; // 5 seconds
    const maxWaitTime = 3 * 60 * 1000; // 3 minutes
    
    if (attempts >= maxAttempts) {
        showAlert(
            'Payment timeout. Please check your phone and try again. Contact support if needed.',
            'warning'
        );
        clearPaymentRequest();
        return;
    }
    
    try {
        const statusResult = await mtnPaymentService.checkPaymentStatus(requestId);
        
        if (!statusResult.success) {
            // Retry after interval
            setTimeout(() => {
                pollPaymentStatus(requestId, paymentData, attempts + 1, maxAttempts);
            }, pollInterval);
            return;
        }
        
        const status = statusResult.status;
        
        if (status === 'SUCCESS') {
            // Payment successful
            handlePaymentSuccess(currentPaymentRequest);
        } else if (status === 'FAILED') {
            // Payment failed
            showAlert(
                'Payment was declined. Please try again with a valid MTN account.',
                'error'
            );
            clearPaymentRequest();
        } else if (status === 'PENDING') {
            // Still pending, continue polling
            setTimeout(() => {
                pollPaymentStatus(requestId, paymentData, attempts + 1, maxAttempts);
            }, pollInterval);
        }
        
    } catch (error) {
        console.error('Status check error:', error);
        setTimeout(() => {
            pollPaymentStatus(requestId, paymentData, attempts + 1, maxAttempts);
        }, pollInterval);
    }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(payment) {
    try {
        // Save donation record to backend
        const donationRecord = {
            donorName: payment.donorName,
            phoneNumber: payment.phoneNumber,
            amount: payment.amount,
            paymentMethod: 'MTN',
            mtnRequestId: payment.requestId,
            campaignId: payment.campaignId || null,
            status: 'COMPLETED',
            timestamp: new Date().toISOString()
        };
        
        // Send to your backend (create an endpoint for this)
        await fetch('/api/donations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(donationRecord)
        }).catch(err => {
            // If backend not available, log to console
            console.log('Donation record:', donationRecord);
        });
        
        // Show success message
        showAlert(
            `Thank you ${payment.donorName}! Your donation of XAF ${formatCurrency(payment.amount)} has been received. A receipt will be sent to your email.`,
            'success'
        );
        
        // Reset form and clear payment data
        document.getElementById('donationForm').reset();
        clearPaymentRequest();
        
        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = 'campaigns.html';
        }, 3000);
        
    } catch (error) {
        console.error('Error handling payment success:', error);
        showAlert('Payment successful but could not save record. Please contact support with your transaction ID.', 'warning');
    }
}

/**
 * Process Orange Money payment
 * Similar to MTN but with Orange API
 */
async function processOrangePayment(paymentData) {
    showAlert('Initiating Orange Money payment... Please wait for authorization prompt on your phone.', 'info');
    // Implementation similar to MTN
    // For now, showing placeholder
    showAlert('Orange Money integration coming soon. Please use MTN for now.', 'warning');
}

/**
 * Clear current payment request
 */
function clearPaymentRequest() {
    currentPaymentRequest = null;
    localStorage.removeItem('currentPayment');
}

/**
 * Check for pending payment on page load
 */
window.addEventListener('load', function() {
    const savedPayment = localStorage.getItem('currentPayment');
    if (savedPayment) {
        const payment = JSON.parse(savedPayment);
        const userConfirms = confirm(
            `You have a pending payment for XAF ${payment.amount}. Do you want to check its status?`
        );
        
        if (userConfirms) {
            pollPaymentStatus(payment.requestId, payment, 0, 36);
        }
    }
});

/**
 * Utility function to format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-CM', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Utility function to show alerts (ensure this exists in your script.js)
 */
function showAlert(message, type = 'info') {
    // Create alert element if showAlert doesn't exist
    if (typeof window.showAlert !== 'function') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.style.cssText = `
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 5px;
            animation: slideDown 0.3s ease-in;
        `;
        
        if (type === 'error') {
            alertDiv.style.backgroundColor = '#f8d7da';
            alertDiv.style.color = '#721c24';
            alertDiv.style.borderLeft = '4px solid #721c24';
        } else if (type === 'success') {
            alertDiv.style.backgroundColor = '#d4edda';
            alertDiv.style.color = '#155724';
            alertDiv.style.borderLeft = '4px solid #155724';
        } else if (type === 'warning') {
            alertDiv.style.backgroundColor = '#fff3cd';
            alertDiv.style.color = '#856404';
            alertDiv.style.borderLeft = '4px solid #856404';
        } else {
            alertDiv.style.backgroundColor = '#d1ecf1';
            alertDiv.style.color = '#0c5460';
            alertDiv.style.borderLeft = '4px solid #0c5460';
        }
        
        document.body.insertBefore(alertDiv, document.body.firstChild);
        
        // Auto remove after 10 seconds if not error
        if (type !== 'error') {
            setTimeout(() => alertDiv.remove(), 10000);
        }
    } else {
        window.showAlert(message, type);
    }
}
