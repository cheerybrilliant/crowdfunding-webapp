/**
 * MTN Payment Handler for Frontend
 * Manages MTN mobile money payment UI and processing
 */

 /**
 * MTN Payment Handler for Frontend
 * Manages MTN mobile money payment UI and processing
 */

class MTNPaymentHandler {
  constructor() {
    this.paymentInProgress = false;
    this.currentDonation = null;
    // DO NOT PUT API KEYS HERE - Use environment variables or backend
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

    this.setupDonationForm();
  }

  /**
   * Setup donation form handler
   */
  setupDonationForm() {
    const donationForm = document.getElementById('donationForm');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const amountInput = document.getElementById('amount');
    if (!donationForm || !paymentMethodSelect || !amountInput) return;

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
      const message = document.getElementById('donationMessage')?.value || '';

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

      if (this.paymentInProgress) {
        showAlert('Payment is already in progress', 'warning');
        return;
      }

      this.paymentInProgress = true;

      // Create donation data
      const donationData = {
        amount: parseFloat(amount),
        donorName: sanitizeInput(donorName),
        donorPhone: paymentMethod === 'mtn' ? this.formatMTNPhone(mtnPhone) : null,
        paymentMethod,
        campaignId: parseInt(campaignId),
        message: sanitizeInput(message),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save to localStorage (TEMPORARY - use backend in production)
      this.currentDonation = this.saveDonationToLocalStorage(donationData);

      if (paymentMethod === 'mtn') {
        await this.handleMTNPaymentFlow();
      } else {
        showAlert('Payment method not yet implemented', 'info');
        this.paymentInProgress = false;
      }

      // Reset form
      event.target.reset();
    } catch (error) {
      console.error('Donation error:', error);
      showAlert('Error processing donation. Please try again.', 'danger');
      this.paymentInProgress = false;
    }
  }

  /**
   * Save donation to localStorage (TEMPORARY SOLUTION)
   */
  saveDonationToLocalStorage(donationData) {
    const donations = JSON.parse(localStorage.getItem('donations') || '[]');
    const newDonation = {
      id: Date.now(),
      ...donationData
    };
    donations.push(newDonation);
    localStorage.setItem('donations', JSON.stringify(donations));
    return newDonation;
  }

  /**
   * Handle MTN payment flow - CALLS BACKEND API (SECURE)
   */
  async handleMTNPaymentFlow() {
    try {
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

      const waitDiv = this.showPaymentWaitingUI();

      // CALL YOUR BACKEND API INSTEAD OF DIRECT MTN API
      // Your backend should handle the MTN MoMo API calls securely
      const response = await fetch('/api/donations/mtn-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          donationId: this.currentDonation.id,
          amount: this.currentDonation.amount,
          phoneNumber: this.currentDonation.donorPhone,
          campaignId: this.currentDonation.campaignId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      const result = await response.json();

      // Poll for payment status
      await this.pollPaymentStatus(result.referenceId, waitDiv);

    } catch (error) {
      console.error('MTN payment flow error:', error);
      showAlert(error.message || 'Error processing MTN payment. Please try again.', 'danger');
      this.paymentInProgress = false;
    }
  }

  /**
   * Poll payment status
   */
  async pollPaymentStatus(referenceId, waitDiv, attempts = 0, maxAttempts = 30) {
    if (attempts >= maxAttempts) {
      if (waitDiv) waitDiv.remove();
      showAlert('Payment confirmation timeout. Please check your account.', 'warning');
      this.paymentInProgress = false;
      return;
    }

    setTimeout(async () => {
      try {
        // Call backend to check status
        const response = await fetch(`/api/donations/check-payment/${referenceId}`);
        const result = await response.json();

        if (result.status === 'SUCCESSFUL') {
          if (waitDiv) waitDiv.remove();
          showAlert('Payment successful! Thank you for your donation.', 'success');
          this.paymentInProgress = false;
          
          // Update campaign
          this.updateCampaignAmount(this.currentDonation.campaignId, this.currentDonation.amount);
          
          // Reload page to show updated donations
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (result.status === 'FAILED') {
          if (waitDiv) waitDiv.remove();
          showAlert('Payment failed. Please try again.', 'danger');
          this.paymentInProgress = false;
        } else {
          // Continue polling
          this.pollPaymentStatus(referenceId, waitDiv, attempts + 1, maxAttempts);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        this.pollPaymentStatus(referenceId, waitDiv, attempts + 1, maxAttempts);
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Update campaign raised amount
   */
  updateCampaignAmount(campaignId, amount) {
    const campaigns = loadCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.raisedAmount = (campaign.raisedAmount || 0) + amount;
      saveCampaigns(campaigns);
    }
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
    const validFormats = [
      /^\+237\d{8,9}$/,
      /^237\d{8,9}$/,
      /^6\d{8}$/,
      /^7\d{8}$/
    ];
    return validFormats.some((format) => format.test(cleaned));
  }

  /**
   * Format MTN phone number
   */
  formatMTNPhone(phoneNumber) {
    let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '237' + cleaned.substring(1);
    }

    if (!cleaned.startsWith('237') && !cleaned.startsWith('+237')) {
      cleaned = '237' + cleaned;
    }

    return cleaned.replace('+', '');
  }

  /**
   * Add MTN payment input to donation form
   */
  injectMTNPhoneInput() {
    const donationForm = document.getElementById('donationForm');
    if (!donationForm) return;

    if (document.getElementById('mtnPhoneGroup')) return;

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
        placeholder="e.g., +237 6XX XXX XXX or 6XXXXXXXX"
        autocomplete="off"
      />
      <small class="form-text text-muted">
        Enter your MTN phone number in Cameroon format
      </small>
    `;

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
    const donations = JSON.parse(localStorage.getItem('donations') || '[]');
    const campaignDonations = donations.filter(d => d.campaignId === campaignId && d.status === 'successful');
    const donationsContainer = document.getElementById('campaignDonations');

    if (!donationsContainer) return;

    if (campaignDonations.length === 0) {
      donationsContainer.innerHTML = '<p class="text-muted">No donations yet. Be the first to donate!</p>';
      return;
    }

    let html = `
      <h4>Recent Donations (${campaignDonations.length})</h4>
      <ul class="list-unstyled">
    `;

    campaignDonations.forEach((donation) => {
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

window.MTNPaymentHandler = MTNPaymentHandler;
window.displayCampaignDonations = displayCampaignDonations;
window.displayCampaignProgress = displayCampaignProgress;
