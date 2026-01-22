# CancerCare Platform - Complete Setup Guide

## 📋 Project Overview

CancerCare is a crowdfunding platform connecting cancer patients with donors and partner hospitals. It features:
- **Frontend**: HTML/CSS/JavaScript responsive web app
- **Backend**: Node.js/Express REST API
- **Database**: MongoDB for data persistence
- **Playground**: Real example implementations and testing

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS)
    ↓ (API calls via config.js)
Backend Server (Node.js/Express)
    ↓ (MongoDB queries)
Database (MongoDB)
```

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 14+ installed
- MongoDB running locally or connection URI configured
- npm or yarn package manager

### 2. Installation

```bash
# Install dependencies
npm install

# Configure environment
# Edit .env file with your MongoDB URI (already configured for localhost)
```

### 3. Run Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Server runs on http://localhost:3000
```

### 4. Run Playground Examples

```bash
# Creates sample data and demonstrates all API endpoints
npm run playground
```

### 5. Open Frontend

Serve the HTML files using any web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Then open: http://localhost:8000
```

## 📁 Project Structure

```
crowdfunding-webapp/
├── server.js              # Backend API server
├── script.js              # Frontend utilities & API client
├── config.js              # Configuration (deprecated - use script.js)
├── playground.js          # Real examples and test data
├── package.json           # Dependencies
├── .env                   # Environment variables
├── index.html             # Home page
├── campaigns.html         # Browse campaigns
├── donate.html            # Donation form (UPDATED)
├── create-account.html    # User registration
├── login.html             # User login
├── events.html            # Health events
├── partner-hospitals.html # Hospital listings
├── hospital-dashboard.html# Hospital admin dashboard
├── hospital-login.html    # Hospital login
├── campaign-details.html  # Individual campaign
├── verification.html      # Patient verification
├── forgot-password.html   # Password recovery
└── about.html             # About page
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Donations
- `POST /api/donations` - Create donation
- `GET /api/donations/:donationId` - Get donation details
- `GET /api/donations/campaign/:campaignId` - Get campaign donations

### Campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - List all active campaigns
- `GET /api/campaigns/:campaignId` - Get campaign details
- `PUT /api/campaigns/:campaignId` - Update campaign

### Events
- `POST /api/events` - Create event
- `GET /api/events` - List all events
- `POST /api/events/:eventId/attend` - Register attendance

### Hospitals
- `POST /api/hospitals` - Register hospital
- `GET /api/hospitals` - List verified hospitals

### Statistics
- `GET /api/stats` - Get platform statistics

## 💻 Frontend Integration

### Using the API Client

All HTML files should include `script.js`:

```html
<script src="script.js"></script>
```

Then use the global `api` object:

```javascript
// Register user
api.register('username', 'email@example.com', 'password', 'donor')
    .then(result => console.log(result))
    .catch(error => showAlert(error.message, 'error'));

// Create donation
api.createDonation({
    campaignId: '123456',
    amount: 50000,
    paymentMethod: 'mtn',
    phoneNumber: '237680123456',
    donorName: 'John Doe',
    donorEmail: 'john@example.com'
})
    .then(result => console.log('Donation created:', result))
    .catch(error => showAlert(error.message, 'error'));

// Get campaigns
api.getCampaigns()
    .then(campaigns => {
        campaigns.forEach(campaign => {
            console.log(campaign.patientName, campaign.currentAmount);
        });
    });
```

### Available Functions

```javascript
// Utilities
formatCurrency(amount)        // Format XAF currency
sanitizeInput(input)          // Prevent XSS attacks
showAlert(message, type)      // Display notifications
rateLimiter.checkLimit(key)   // Rate limit form submissions

// API Methods
api.register(...)             // Register user
api.login(...)                // Login user
api.createDonation(...)       // Create donation
api.getDonation(id)           // Get donation details
api.getCampaigns()            // List campaigns
api.getCampaign(id)           // Get campaign details
api.createCampaign(...)       // Create campaign
api.updateCampaign(id, data)  // Update campaign
api.getEvents()               // List events
api.createEvent(...)          // Create event
api.attendEvent(id, userId)   // Register for event
api.getHospitals()            // List hospitals
api.registerHospital(...)     // Register hospital
api.getStats()                // Get platform stats
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  userType: 'donor' | 'patient' | 'hospital',
  phone: String,
  hospitalName: String,
  hospitalVerification: Boolean,
  createdAt: Date
}
```

### Campaigns Collection
```javascript
{
  patientName: String,
  patientId: ObjectId,
  story: String,
  targetAmount: Number,
  currentAmount: Number,
  status: 'active' | 'completed' | 'closed',
  hospitalPartner: String,
  endDate: Date,
  createdAt: Date
}
```

### Donations Collection
```javascript
{
  campaignId: ObjectId,
  donorId: ObjectId,
  amount: Number,
  paymentMethod: 'mtn' | 'orange',
  phoneNumber: String,
  donorName: String,
  donorEmail: String,
  status: 'pending' | 'completed' | 'failed',
  transactionId: String,
  createdAt: Date
}
```

### Events Collection
```javascript
{
  title: String,
  description: String,
  date: Date,
  location: String,
  organizer: String,
  category: 'seminar' | 'awareness' | 'medical_gathering',
  attendees: [ObjectId],
  createdAt: Date
}
```

### Hospitals Collection
```javascript
{
  name: String,
  location: String,
  phone: String,
  email: String,
  specialization: [String],
  verificationStatus: 'pending' | 'verified' | 'rejected',
  createdAt: Date
}
```

## 📊 Real Playground Examples

The `playground.js` file creates real data demonstrating:

1. **User Registration** - 3 user types (donor, patient, hospital)
2. **Hospital Partnership** - 2 verified hospitals
3. **Campaigns** - 2 active fundraising campaigns
4. **Donations** - 3 completed donations (XAF 750,000 total)
5. **Campaign Progress** - Calculate fundraising percentage
6. **Events** - 2 health awareness events
7. **Statistics** - Platform-wide metrics
8. **Donation History** - Per-campaign donation tracking

Run it:
```bash
npm run playground
```

Sample Output:
```
📌 EXAMPLE 1: User Registration & Authentication
✓ Donor registered: john@example.com
✓ Patient registered: marie@example.com
✓ Hospital registered: Yaoundé Central Hospital

📌 EXAMPLE 2: Hospital Partnership Registration
✓ Hospital registered: Yaoundé Central Hospital
  Specializations: Oncology, Chemotherapy, Radiotherapy

📌 EXAMPLE 4: Process Donations
✓ Donation processed
  Donor: John Doe
  Amount: XAF 500,000
  Method: MTN
  Transaction ID: TXN_001_2026

📌 EXAMPLE 5: Campaign Progress Tracking
Campaign: Marie Kenfack
  Status: ACTIVE
  Raised: XAF 750,000 / XAF 2,000,000
  Progress: 37.5%

📊 Database Summary:
   • 3 users created
   • 2 campaigns created
   • 3 donations processed
   • 2 events scheduled
   • 2 hospitals registered
```

## 🔐 Security Features

1. **Password Hashing**: bcryptjs for secure password storage
2. **Input Sanitization**: XSS prevention in forms
3. **Rate Limiting**: Prevent form spam (5 attempts per 60s)
4. **Phone Validation**: Cameroon number format verification
5. **Amount Validation**: Min XAF 500, Max XAF 100,000,000
6. **CORS Protection**: Cross-origin request handling

## 📱 Example Usage in HTML

```html
<!-- Login Form Connected to Backend -->
<form id="loginForm">
    <input type="email" id="email" required>
    <input type="password" id="password" required>
    <button type="submit">Login</button>
</form>

<script src="script.js"></script>
<script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const result = await api.login(
                document.getElementById('email').value,
                document.getElementById('password').value
            );
            showAlert('Login successful!', 'success');
            // Redirect to dashboard
            window.location.href = 'campaigns.html';
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
</script>
```

## 🧪 Testing the Connection

1. **Start MongoDB**
2. **Run backend**: `npm run dev`
3. **Run playground**: `npm run playground`
4. **Serve frontend**: `python -m http.server 8000`
5. **Check browser console**: Should show "Frontend initialized"
6. **Test donation**: Fill form in donate.html, submit, check console for API calls

## 🐛 Troubleshooting

**Backend won't start**
- Check MongoDB connection: `mongosh`
- Verify .env file has correct MONGODB_URI
- Check port 3000 isn't in use

**Frontend can't reach backend**
- Ensure backend is running on port 3000
- Check CORS is enabled (it is in server.js)
- Check browser console for network errors

**Donations not saving**
- Check MongoDB is running
- Verify phone number format (6XXXXXXXX)
- Check browser console for validation errors

## 📈 Next Steps

1. **Frontend**: Update other HTML files to use `api.*` methods
2. **Payment Integration**: Connect to MTN/Orange mobile money APIs
3. **Authentication**: Implement JWT tokens for logged-in sessions
4. **Deployment**: Deploy backend to Heroku/AWS, frontend to GitHub Pages
5. **Admin Dashboard**: Create hospital admin interface
6. **Notifications**: Add email confirmations for donations

## 📧 Support

Contact: +237 680 480 725 or +237 681 018 022

---

**Status**: ✅ Backend API, Database Schema, and Playground Complete
**Last Updated**: January 22, 2026
