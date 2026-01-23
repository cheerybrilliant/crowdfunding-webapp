/**
 * MTN Payment Handler for Frontend
 * Manages MTN mobile money payment UI and processing
 */

class MTNPaymentHandler {
  constructor() {
    this.paymentInProgress = false;
    this.currentDonation = null;
  }

  /**
   * Setup MTN payment form and UI
   */
  setupMTNPaymentUI() {
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const mtnPhoneGroup = document.getElementById('mtnPhoneGroup');

    if (paymentMethodSelect && mtnPhoneGroup) {
      paymentMethodSelect.addEventListener('change', (e) => {
        if (e.target.value === 'mtn') {
          mtnPhoneGroup.style.display = 'block';
        } else {
          mtnPhoneGroup.style.display = 'none';
        }
      });
    }

    // Setup donation form
    this.setupDonationForm();
  }

  /**
   * Setup donation form handler
   */
  setupDonationForm() {
    const donationForm = document.getElementById('donationForm');
    if (!donationForm) return;

    donationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleDonationSubmit(e);
    });
  }

  /**
   * Handle donation form submission
   */
  async handleDonationSubmit(event) {
    try {
      const amount = document.getElementById('amount').value;
      const donorName = document.getElementById('donorName').value || 'Anonymous';
      const mtnPhone = document.getElementById('mtnPhone').value;
      const paymentMethod = document.getElementById('paymentMethod').value;
      const campaignId = document.getElementById('campaignId').value;
      const message = document.getElementById('donationMessage').value;

      // Validation
      if (!amount || amount < 500) {
        showAlert('Donation amount must be at least 500 XAF', 'warning');
        return;
      }

      if (paymentMethod === 'mtn' && !mtnPhone) {
        showAlert('Please enter your MTN phone number', 'warning');
        return;
      }

      if (paymentMethod === 'mtn' && !this.validateMTNPhone(mtnPhone)) {
        showAlert(
          'Please enter a valid MTN phone number (e.g., +237 or 237 followed by 8-9 digits)',
          'warning'
        );
        return;
      }

      // Prevent duplicate submissions
      if (this.paymentInProgress) {
        showAlert('Payment is already in progress', 'warning');
        return;
      }

      this.paymentInProgress = true;

      // Create donation
      const donationData = {
        amount: parseFloat(amount),
        donorName: sanitizeInput(donorName),
        donorPhone: paymentMethod === 'mtn' ? this.formatMTNPhone(mtnPhone) : null,
        paymentMethod,
        campaignId,
        message: sanitizeInput(message),
      };

      const donation = await DonationManager.createDonation(donationData);
      this.currentDonation = donation.donation;

      if (paymentMethod === 'mtn') {
        this.handleMTNPaymentFlow();
      }

      // Reset form
      event.target.reset();
    } catch (error) {
      console.error('Donation error:', error);
      this.paymentInProgress = false;
    }
  }

  /**
   * Handle MTN payment flow
   */
  async handleMTNPaymentFlow() {
   /**
 * Handle MTN payment flow - REAL MTN MoMo API integration
 */
    try {
        // Show payment confirmation prompt
        const confirmPayment = confirm(
            `A payment prompt will be sent to your MTN phone (${this.currentDonation.donorPhone}).\n\n` +
            'Please confirm the payment on your phone to complete the donation.\n\n' +
            'Click OK to proceed.'
        );

        if (!confirmPayment) {
            showAlert('Payment cancelled', 'info');
            this.paymentInProgress = false;
            return;
        }

        // Show waiting UI
        const waitDiv = this.showPaymentWaitingUI();

        // === REAL MTN MoMo API CALLS START HERE ===

        // 1. Get access token
        const token = await this.getMoMoAccessToken();

        // 2. Generate unique reference ID
        const referenceId = crypto.randomUUID();

        // 3. Initiate Request to Pay
        const payload = {
            amount: this.currentDonation.amount.toString(),
            currency: 'XAF',  // Change to 'EUR' if testing in sandbox
            externalId: `donation_${this.currentDonation.id}_${Date.now()}`,
            payer: {
                partyIdType: 'MSISDN',
                partyId: this.currentDonation.donorPhone
            },
            payerMessage: 'Donation to CancerCare Event',
            payeeNote: 'Thank you for your support!'
        };

        const initiateResponse = await fetch('https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay', {  // Change to production URL later
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Reference-Id': referenceId,
                'X-Target-Environment': 'sandbox',  // Change to '237' for Cameroon production
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': '0fb3b33116c547ff952f429e5036ae0e'  // ← Replace with your key
            },
            body: JSON.stringify(payload)
        });

        if (!initiateResponse.ok) {
            const err = await initiateResponse.json();
            throw new Error(err.message || 'Failed to initiate MTN payment request');
        }

        // 4. Update donation with referenceId (for polling)
        await DonationManager.updateDonation(this.currentDonation.id, { referenceId });

        // 5. Start polling for status (your existing function)
        await DonationManager.pollMTNPaymentStatus(this.currentDonation.id, referenceId);

        // Payment successful → remove waiting UI
        if (waitDiv) waitDiv.remove();

        showAlert('Payment successful! Thank you for your donation.', 'success');
        this.paymentInProgress = false;

    } catch (error) {
        console.error('MTN payment flow error:', error);
        showAlert(error.message || 'Error processing MTN payment. Please try again.', 'danger');
        if (waitDiv) waitDiv.remove();
        this.paymentInProgress = false;
    }
}

/**
 * Get MTN MoMo access token
 */
async getMoMoAccessToken() {
    const basicAuth = btoa('crowdfundsme:0fb3b33116c547ff952f429e5036ae0e');  // ← Replace with your API_USER:API_KEY
    const response = await fetch('https://sandbox.momodeveloper.mtn.com/collection/token/', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Ocp-Apim-Subscription-Key': '0fb3b33116c547ff952f429e5036ae0e'  // ← Replace
        }
    });

    if (!response.ok) throw new Error('Failed to get MTN access token');
    const data = await response.json();
    return data.access_token;
}
  /**
   * Show waiting UI for payment confirmation
   */
  showPaymentWaitingUI() {
    const waitDiv = document.createElement('div');
    waitDiv.id = 'paymentWaiting';
    waitDiv.className = 'alert alert-info';
    waitDiv.innerHTML = `
      <div class="text-center">
        <p><strong>Payment in Progress...</strong></p>
        <p>Waiting for MTN confirmation on <strong>${this.currentDonation.donorPhone}</strong></p>
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p><small>This may take up to 5 minutes</small></p>
      </div>
    `;
    waitDiv.style.margin = '20px 0';

    const container = document.querySelector('.container') || document.body;
    container.insertBefore(waitDiv, container.firstChild);

    return waitDiv;
  }

  /**
   * Validate MTN phone number
   */
  validateMTNPhone(phoneNumber) {
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Valid formats: +237XXXXXXXXX, 237XXXXXXXXX
    const validFormats = [
      /^\+237\d{8,9}$/,   // +237XXXXXXXXX (9 or 10 digits)
      /^237\d{8,9}$/,     // 237XXXXXXXXX

    ];

    return validFormats.some((format) => format.test(cleaned));
  }

  /**
   * Format MTN phone number
   */
  formatMTNPhone(phoneNumber) {
    let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Remove leading 0 if present and add 237
    if (cleaned.startsWith('0')) {
      cleaned = '237' + cleaned.substring(1);
    }

    // Add 237 if not present
    if (!cleaned.startsWith('237')) {
      cleaned = '237' + cleaned;
    }

    return cleaned;
  }

  /**
   * Add MTN payment input to donation form
   */
  injectMTNPhoneInput() {
    const donationForm = document.getElementById('donationForm');
    if (!donationForm) return;

    // Check if already injected
    if (document.getElementById('mtnPhoneGroup')) return;

    // Create MTN phone input group
    const mtnPhoneGroup = document.createElement('div');
    mtnPhoneGroup.id = 'mtnPhoneGroup';
    mtnPhoneGroup.className = 'form-group';
    mtnPhoneGroup.style.display = 'none';
    mtnPhoneGroup.innerHTML = `
      <label for="mtnPhone">MTN Phone Number <span style="color: red;">*</span></label>
      <input 
        type="tel" 
        id="mtnPhone" 
        class="form-control" 
        placeholder="e.g., +237 6XX XXX XXX or 0XXXXXXXXX"
        autocomplete="off"
      />
      <small class="form-text text-muted">
        Enter your MTN phone number in Cameroon format
      </small>
    `;

    // Insert after payment method select
    const paymentMethodGroup = document.querySelector('[id*="paymentMethod"]')?.parentElement;
    if (paymentMethodGroup) {
      paymentMethodGroup.insertAdjacentElement('afterend', mtnPhoneGroup);
    }
  }
}

/**
 * Display campaign donations
 */
async function displayCampaignDonations(campaignId) {
  try {
    const donations = await DonationManager.getDonationsByCampaign(campaignId);
    const donationsContainer = document.getElementById('campaignDonations');

    if (!donationsContainer) return;

    if (donations.length === 0) {
      donationsContainer.innerHTML = '<p class="text-muted">No donations yet</p>';
      return;
    }

    let html = `
      <h4>Recent Donations (${donations.length})</h4>
      <ul class="list-unstyled">
    `;

    donations.forEach((donation) => {
      html += `
        <li class="donation-item" style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${sanitizeInput(donation.donorName)}</strong> donated 
          <strong>${donation.amount.toLocaleString()} XAF</strong>
          <br/>
          <small class="text-muted">${new Date(donation.createdAt).toLocaleDateString()}</small>
          ${donation.message ? `<br/><em>"${sanitizeInput(donation.message)}"</em>` : ''}
        </li>
      `;
    });

    html += '</ul>';
    donationsContainer.innerHTML = html;
  } catch (error) {
    console.error('Failed to display donations:', error);
  }
}

/**
 * Display campaign progress
 */
function displayCampaignProgress(campaign) {
  const progressContainer = document.getElementById('campaignProgress');
  if (!progressContainer) return;

  const percentage = Math.min(
    ((campaign.raisedAmount || 0) / campaign.goalAmount) * 100,
    100
  );

  progressContainer.innerHTML = `
    <div class="progress" style="margin: 20px 0;">
      <div 
        class="progress-bar" 
        role="progressbar" 
        style="width: ${percentage}%"
        aria-valuenow="${percentage}" 
        aria-valuemin="0" 
        aria-valuemax="100"
      >
        ${percentage.toFixed(1)}%
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <span><strong>${(campaign.raisedAmount || 0).toLocaleString()} XAF</strong> raised</span>
      <span><strong>${campaign.goalAmount.toLocaleString()} XAF</strong> goal</span>
    </div>
  `;
}

/**
 * Initialize MTN payment handler
 */
document.addEventListener('DOMContentLoaded', () => {
  const mtnHandler = new MTNPaymentHandler();
  mtnHandler.setupMTNPaymentUI();
  mtnHandler.injectMTNPhoneInput();

  window.MTNPaymentHandler = mtnHandler;
});

// Make available globally
window.MTNPaymentHandler = MTNPaymentHandler;
window.displayCampaignDonations = displayCampaignDonations;
window.displayCampaignProgress = displayCampaignProgress;
