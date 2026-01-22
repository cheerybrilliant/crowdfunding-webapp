# CancerCare Backend Setup Guide

## Overview
This guide will help you set up the CancerCare crowdfunding platform backend with MongoDB and MTN payment integration.

## Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)
- MTN Mobile Money API credentials

## Step 1: Backend Setup

### 1.1 Install Dependencies
```bash
cd backend
npm install
```

### 1.2 Configure Environment Variables
Edit `backend/.env` file with your credentials:

```env
# Database
DATABASE_URL=mongodb+srv://takowbrilliant25_db_user:myMGXPLDEdRT9UpT@crowdfundme.w1f5rix.mongodb.net/cancercare

# JWT
JWT_SECRET=your_secure_jwt_secret_key_here

# Server
PORT=3001
NODE_ENV=development

# MTN Payment Keys (PRIMARY AND SECONDARY)
MTN_API_KEY=your_mtn_api_key
MTN_API_SECRET=your_mtn_api_secret
MTN_SUBSCRIPTION_KEY=your_mtn_subscription_key
MTN_PRIMARY_KEY=your_mtn_primary_key
MTN_SECONDARY_KEY=your_mtn_secondary_key
MTN_BUSINESS_PARTNER_ID=your_business_partner_id
MTN_BUSINESS_PARTNER_PIN=your_business_partner_pin
PAYMENT_ENV=sandbox

# Hospital Verification
HOSPITAL_VERIFICATION_CODE=your_hospital_code

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 1.3 Setup Prisma
```bash
# Generate Prisma Client
npm run prisma:generate

# Create database schema
npm run prisma:migrate
```

### 1.4 Seed Database (Optional)
```bash
npm run seed
```

### 1.5 Start Backend Server
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Step 2: Frontend Setup

### 2.1 Update HTML Files
Add the following script tags to your HTML files (in order):

```html
<!-- API Client -->
<script src="api-client.js"></script>

<!-- Backend Integration -->
<script src="backend-integration.js"></script>

<!-- MTN Payment Handler -->
<script src="mtn-payment-handler.js"></script>

<!-- Your existing script.js -->
<script src="script.js"></script>
```

### 2.2 Update Donation Form
Ensure your donation form has these input elements:

```html
<form id="donationForm">
  <div class="form-group">
    <label for="amount">Amount (XAF)</label>
    <input type="number" id="amount" class="form-control" min="500" required/>
  </div>

  <div class="form-group">
    <label for="donorName">Your Name</label>
    <input type="text" id="donorName" class="form-control"/>
  </div>

  <div class="form-group">
    <label for="paymentMethod">Payment Method</label>
    <select id="paymentMethod" class="form-control" required>
      <option value="">Select Payment Method</option>
      <option value="mtn">MTN Mobile Money</option>
      <option value="orange">Orange Money</option>
      <option value="paystack">Paystack</option>
      <option value="bank">Bank Transfer</option>
    </select>
  </div>

  <!-- MTN Phone will be auto-injected -->
  <div id="mtnPhoneGroup" class="form-group" style="display: none;">
    <label for="mtnPhone">MTN Phone Number</label>
    <input type="tel" id="mtnPhone" class="form-control" placeholder="+237 6XX XXX XXX"/>
  </div>

  <div class="form-group">
    <label for="donationMessage">Message (Optional)</label>
    <textarea id="donationMessage" class="form-control" rows="3"></textarea>
  </div>

  <input type="hidden" id="campaignId" value=""/>

  <button type="submit" class="btn btn-primary">Donate Now</button>
</form>

<!-- Progress display -->
<div id="campaignProgress"></div>

<!-- Donations list -->
<div id="campaignDonations"></div>
```

### 2.3 Update Authentication Forms
Ensure your registration and login forms have proper IDs:

```html
<!-- Registration Form -->
<form id="registerForm">
  <input type="text" id="fullName" placeholder="Full Name" required/>
  <input type="email" id="email" placeholder="Email" required/>
  <input type="tel" id="phone" placeholder="Phone" required/>
  <select id="accountType" required>
    <option value="">Select Account Type</option>
    <option value="donor">Donor</option>
    <option value="patient">Patient</option>
  </select>
  <input type="password" id="password" placeholder="Password" required/>
  <input type="password" id="confirmPassword" placeholder="Confirm Password" required/>
  <button type="submit">Register</button>
</form>

<!-- Login Form -->
<form id="loginForm">
  <input type="email" id="email" placeholder="Email" required/>
  <input type="password" id="password" placeholder="Password" required/>
  <button type="submit">Login</button>
</form>
```

## Step 3: MTN Payment Configuration

### 3.1 Getting MTN API Credentials
1. Go to [MTN Developer Portal](https://developer.mtn.com/)
2. Register and create an application
3. Get your API credentials:
   - **Primary Key**: For production transactions
   - **Secondary Key**: For backup/fallback transactions
   - **Subscription Key**: For API authentication
   - **Business Partner ID**: Your merchant identifier

### 3.2 Testing MTN Integration
```bash
# In backend directory
node test-mtn-integration.js
```

## Step 4: API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/hospital/register` - Hospital registration
- `POST /api/auth/hospital/login` - Hospital login

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create campaign (requires auth)
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Donations
- `POST /api/donations` - Create donation
- `GET /api/donations/:id` - Get donation details
- `GET /api/donations/:donationId/mtn-status` - Check MTN payment status
- `GET /api/donations/campaign/:campaignId` - Get campaign donations

### Health
- `GET /api/health` - Server health check

## Frontend Usage Examples

### Registration
```javascript
await AuthManager.register({
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '+237690000000',
  password: 'SecurePass123!',
  accountType: 'donor'
});
```

### Login
```javascript
await AuthManager.login('john@example.com', 'SecurePass123!');
```

### Create Campaign
```javascript
await CampaignManager.createCampaign({
  title: 'Help John Fight Cancer',
  description: 'John needs urgent treatment...',
  goalAmount: 5000000,
  patientName: 'John Doe',
  hospitalName: 'Central Hospital',
  patientAge: 35
});
```

### Create Donation with MTN
```javascript
await DonationManager.createDonation({
  amount: 10000,
  donorName: 'Jane Smith',
  donorPhone: '+237690000000',
  paymentMethod: 'mtn',
  campaignId: 'campaign-id',
  message: 'Get well soon!'
});
```

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure database name exists

### MTN Payment Issues
- Verify all MTN credentials are correct
- Check PAYMENT_ENV is set to 'sandbox' for testing
- Validate phone number format (237XXXXXXXXX)
- Check subscription key and API key

### CORS Issues
- Ensure frontend URL is in ALLOWED_ORIGINS
- Check browser console for specific errors
- Verify backend is running on correct port

### Port Conflicts
- Change PORT in .env if 3001 is occupied
- Update frontend API_BASE_URL accordingly

## Production Deployment

### 1. Environment Setup
```bash
# Create production .env
NODE_ENV=production
PAYMENT_ENV=production
MTN_PRIMARY_KEY=actual_production_key
MTN_SECONDARY_KEY=actual_secondary_key
# ... other production credentials
```

### 2. Build Backend
```bash
npm run build
npm start
```

### 3. Database Backup
```bash
npm run prisma:migrate -- --name "production_migration"
```

### 4. Security Checklist
- ✓ Change all default passwords
- ✓ Update JWT_SECRET to a strong value
- ✓ Enable HTTPS
- ✓ Set NODE_ENV=production
- ✓ Configure proper CORS origins
- ✓ Use environment variables for secrets
- ✓ Enable database backups
- ✓ Set up monitoring and logging

## Support
For issues or questions, please check the documentation or contact the development team.
