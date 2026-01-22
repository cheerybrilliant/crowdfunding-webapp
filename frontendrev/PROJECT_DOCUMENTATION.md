# CancerCare Crowdfunding Platform - Complete Documentation

## 📋 Project Overview

**Project Name:** CancerCare Crowdfunding Platform  
**Purpose:** Help cancer patients in Yaoundé, Cameroon raise funds for treatment  
**Team:** 6 Level 2 Web Development Students  
**Technology Stack:** HTML5, CSS3, Vanilla JavaScript, localStorage  
**Architecture:** Frontend-only (ready for backend integration)

---

## 🏗️ Project Structure

### **Core Files**

#### 1. **index.html** - Home Page
- **Purpose:** Landing page with featured campaigns and platform overview
- **Features:**
  - Hero section with call-to-action
  - Featured campaigns display (all campaigns shown)
  - Platform statistics
  - How it works section
  - Navigation to all pages
- **Data Used:** campaigns (localStorage)

#### 2. **script.js** - Core JavaScript Functions
- **Purpose:** Shared utilities and security functions
- **Key Functions:**
  - `sanitizeHTML()` - XSS protection
  - `sanitizeInput()` - Input validation
  - `validateEmail()` - Email format validation
  - `validatePassword()` - Strong password validation (returns object with isValid and message)
  - `hashPassword()` - Simple password hashing (educational - use bcrypt in production)
  - `generateSecureToken()` - Cryptographically random session tokens
  - `getUserDatabase()` - Get all users (array format)
  - `saveUserData()` - Save user with hashed password
  - `getCurrentUser()` - Get logged-in user
  - `formatCurrency()` - Format XAF currency
  - `getCampaignById()` - Get campaign by ID
  - `validateHospitalLogin()` - Hospital authentication with approval check

#### 3. **styles.css** - Global Styles
- **Purpose:** Consistent styling across all pages
- **Color Scheme:**
  - Primary: #1976D2 (Blue)
  - Secondary: #FFFFFF (White)
  - Success: #2ecc71 (Green)
  - Error: #e74c3c (Red)
- **Features:**
  - Responsive design
  - Card-based layouts
  - Progress bars
  - Button styles
  - Form styling

---

## 👥 User Management Pages

### **create-account.html** - User Registration
- **Purpose:** New user account creation
- **User Types:** Patient, Donor
- **Fields:** Full Name, Email, Phone, Password, Confirm Password
- **Validation:**
  - Email format check
  - Password strength (8+ chars, uppercase, lowercase, number, special char)
  - Password match confirmation
  - Duplicate email check
- **Data Stored:** userDatabase (array in localStorage)

### **login.html** - User Login
- **Purpose:** User authentication
- **Process:**
  1. Validate email format
  2. Validate password format
  3. Check credentials against userDatabase
  4. Create session with secure token
  5. Redirect to appropriate dashboard
- **Redirects:**
  - Patient → patient-dashboard.html
  - Donor → donor-dashboard.html

### **verification.html** - Patient Verification
- **Purpose:** Patients submit medical documents for hospital verification
- **Fields:** Full Name, Email, Phone, Hospital, Medical Documents (file upload)
- **Process:**
  1. Patient submits verification request
  2. Stored in verificationRequests (localStorage)
  3. Hospital reviews in hospital-dashboard.html
  4. If approved, campaign auto-created

### **forgot-password.html** - Password Recovery
- **Purpose:** Password reset functionality
- **Note:** Currently frontend-only (needs backend email service)

---

## 🏥 Hospital Management Pages

### **hospital-register.html** - Hospital Registration
- **Purpose:** New hospital partner registration
- **Verification Code:** CANCER2026 (required)
- **Fields:**
  - Hospital Name
  - Address
  - Phone Number
  - Admin Name
  - Admin Email
  - Password
- **Status:** All new hospitals start as "pending"
- **Approval:** Admin must approve via admin-panel.html
- **Data Stored:** hospitals (array in localStorage)

### **hospital-login.html** - Hospital Authentication
- **Purpose:** Hospital staff login
- **Validation:**
  - Hospital ID exists
  - Password correct
  - Hospital status is "active" (approved by admin)
- **Redirect:** hospital-dashboard.html

### **hospital-dashboard.html** - Hospital Control Panel
- **Purpose:** Manage patient verifications
- **Features:**
  - View pending verification requests
  - Approve/reject patient verifications
  - Auto-create campaigns when approving patients
  - View hospital statistics
- **Campaign Creation:**
  - Automatically creates campaign with hospital name and date
  - Sets verified: true
  - Adds to campaigns (localStorage)

---

## 💰 Campaign & Donation Pages

### **campaigns.html** - All Campaigns
- **Purpose:** Display all patient campaigns
- **Information Shown:**
  - Patient name
  - Verified badge (if hospital-verified)
  - Hospital name
  - Campaign creation date
  - Patient story
  - Funding goal and raised amount
  - Progress bar
  - Donor count
- **Actions:** View Details, Donate

### **campaign-details.html** - Single Campaign View
- **Purpose:** Detailed campaign information
- **Features:**
  - Patient photo upload/display
  - Full patient story
  - Funding details
  - Progress visualization
  - Donation button
  - Hospital and date information
- **Data:** Stores patient photos in localStorage as base64

### **donate.html** - Donation Processing
- **Purpose:** Accept donations for campaigns or events
- **Payment Methods:**
  - MTN Mobile Money
  - Orange Money
  - Bank Transfer (simulated)
- **Process:**
  1. Select campaign or event
  2. Enter amount
  3. Choose payment method
  4. Enter payment details
  5. Store donation record
  6. Update campaign/event raised amount
- **Data Stored:** 
  - donations (array in localStorage)
  - eventDonations (array in localStorage)
  - Updates campaigns or events raised amounts

---

## 🎯 Dashboard Pages

### **patient-dashboard.html** - Patient Dashboard
- **Purpose:** Patient account management
- **Features:**
  - View verification status
  - View campaign (if verified)
  - Campaign statistics
  - Donation history
  - Profile information

### **donor-dashboard.html** - Donor Dashboard
- **Purpose:** Donor account management
- **Features:**
  - Donation history
  - Total donated amount
  - Impact badges (based on donation amount)
  - Campaigns supported
  - Profile information
- **Gamification:**
  - Bronze Badge: 100,000+ XAF
  - Silver Badge: 500,000+ XAF
  - Gold Badge: 1,000,000+ XAF
  - Platinum Badge: 5,000,000+ XAF

---

## 🎉 Events & Information Pages

### **events.html** - Health Events
- **Purpose:** Display health awareness events and seminars
- **Features:**
  - Event listings with funding goals
  - Donation progress tracking
  - "Fully Funded" status
  - Donate to events
- **Data:** events (array in localStorage)

### **about.html** - About Us
- **Purpose:** Platform information and team
- **Content:**
  - Mission statement
  - How it works
  - Team member photos (6 students)
  - Contact information

### **partner-hospitals.html** - Partner Hospitals
- **Purpose:** Display verified partner hospitals
- **Current Partner:** CHU Hospital Yaoundé (Total Energies Melen 1)
- **Dynamic:** Shows approved hospitals from localStorage
- **Become a Partner:** Information for new hospitals

---

## 🔐 Admin Panel

### **admin-panel.html** - Platform Administration
- **Access:** Direct URL or footer link on home page
- **Login Credentials:**
  - Username: admin
  - Password: CancerCare2026
  - **⚠️ CHANGE BEFORE PRODUCTION!**

#### **Admin Features:**

**1. Overview Tab**
- Total users count
- Active campaigns count
- Total donations amount
- Health events count
- Recent activity feed

**2. Hospitals Tab**
- View all hospital registrations
- Approve pending hospitals
- Reject fake hospitals
- View hospital details
- Delete hospitals

**3. Campaigns Tab**
- View all campaigns
- Campaign statistics
- Delete campaigns
- View campaign details

**4. Users Tab**
- View all registered users
- User information
- Delete users
- Monitor registrations

**5. Events Tab**
- View all health events
- Event funding status
- Delete events

**6. Donations Tab**
- Complete donation history
- Filter by campaign/event
- Payment method tracking
- Date and amount details

---

## 💾 Data Structure (localStorage)

### **userDatabase** (Array)
```javascript
[
  {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "680480725",
    accountType: "patient" | "donor",
    userType: "patient" | "donor",
    verified: true | false,
    passwordHash: "hashed_password",
    sessionToken: "random_token",
    registrationDate: "2026-01-20T10:00:00.000Z"
  }
]
```

### **hospitals** (Array)
```javascript
[
  {
    hospitalId: "unique_id",
    hospitalName: "CHU Hospital Yaoundé",
    address: "Total Energies Melen 1, Yaoundé",
    phone: "680480725",
    adminName: "Dr. Admin",
    adminEmail: "admin@hospital.com",
    password: "hashed_password",
    registeredDate: "2026-01-20T10:00:00.000Z",
    status: "pending" | "active" | "rejected",
    verified: true | false,
    verifiedPatients: [],
    services: "Oncology Department, Cancer Screening..."
  }
]
```

### **campaigns** (Array)
```javascript
[
  {
    id: "unique_id",
    patientName: "Patient Name",
    story: "Short story...",
    fullStory: "Full story...",
    goalAmount: 5000000,
    raisedAmount: 0,
    verified: true | false,
    hospitalName: "CHU Hospital Yaoundé",
    createdDate: "2026-01-20T10:00:00.000Z",
    donations: []
  }
]
```

### **events** (Array)
```javascript
[
  {
    id: "unique_id",
    title: "Event Title",
    description: "Event description...",
    date: "2026-02-15",
    location: "Yaoundé",
    fundingGoal: 2000000,
    raisedAmount: 0,
    status: "upcoming" | "completed"
  }
]
```

### **donations** (Array)
```javascript
[
  {
    id: "unique_id",
    campaignId: "campaign_id",
    donorName: "Donor Name",
    donorEmail: "donor@example.com",
    amount: 50000,
    paymentMethod: "MTN" | "Orange" | "Bank",
    date: "2026-01-20T10:00:00.000Z",
    target: "campaign" | "event"
  }
]
```

### **verificationRequests** (Array)
```javascript
[
  {
    id: "unique_id",
    fullName: "Patient Name",
    email: "patient@example.com",
    phone: "680480725",
    hospital: "CHU Hospital Yaoundé",
    medicalDocuments: "base64_file_data",
    status: "pending" | "approved" | "rejected",
    submittedDate: "2026-01-20T10:00:00.000Z"
  }
]
```

### **currentUser** (Object)
```javascript
{
  fullName: "Current User",
  email: "user@example.com",
  phone: "680480725",
  accountType: "patient" | "donor",
  userType: "patient" | "donor",
  verified: true | false,
  sessionToken: "random_token",
  registrationDate: "2026-01-20T10:00:00.000Z"
}
```

---

## 🔒 Security Features

### **Implemented:**
1. **XSS Protection** - HTML sanitization on all inputs
2. **Password Hashing** - Simple hash (educational - use bcrypt in production)
3. **Session Tokens** - Cryptographically random tokens
4. **Input Validation** - Email, phone, password validation
5. **Rate Limiting** - Prevent brute force attacks (in script.js)
6. **Hospital Verification** - Admin approval required
7. **Verification Code** - CANCER2026 for hospital registration

### **⚠️ Production Requirements:**
1. Replace `hashPassword()` with bcrypt or similar
2. Implement server-side authentication
3. Use HTTPS
4. Add CSRF protection
5. Implement proper session management
6. Add database encryption
7. Change admin credentials
8. Add email verification
9. Implement 2FA for admin

---

## 📞 Contact Information

**Phone Numbers:**
- +237 680 480 725
- +237 681 018 022

**Office Hours:**
- Monday - Friday
- 8:00 AM - 5:00 PM

**Location:**
- Yaoundé, Cameroon

---

## 🐛 Known Issues & Fixes Applied

### **Fixed Issues:**

1. ✅ **Password Validation Inconsistency**
   - **Problem:** validatePassword() returned boolean but hospital-register.html expected object
   - **Fix:** Updated validatePassword() to return {isValid, message} object
   - **Files Updated:** script.js, create-account.html, login.html

2. ✅ **User Database Format Inconsistency**
   - **Problem:** userDatabase stored as object but admin panel expected array
   - **Fix:** Converted to array format with backward compatibility
   - **Files Updated:** script.js, create-account.html, login.html

3. ✅ **Campaign Display Missing Information**
   - **Problem:** Campaigns didn't show hospital name and date
   - **Fix:** Added hospital name and creation date to all campaign displays
   - **Files Updated:** index.html, campaigns.html, campaign-details.html

4. ✅ **Admin Credentials Exposed**
   - **Problem:** Default credentials shown on login page
   - **Fix:** Removed credential hints from admin-panel.html
   - **Files Updated:** admin-panel.html

---

## ✅ Testing Checklist

### **User Flow Testing:**
- [x] Create donor account
- [x] Create patient account
- [x] Login as donor
- [x] Login as patient
- [x] Submit patient verification
- [x] Register hospital
- [x] Login as hospital (after admin approval)
- [x] Approve patient verification
- [x] View auto-created campaign
- [x] Make donation to campaign
- [x] Make donation to event
- [x] View donor dashboard
- [x] View patient dashboard
- [x] Access admin panel
- [x] Approve hospital
- [x] Delete campaign
- [x] Delete user
- [x] Delete event

### **Page Loading:**
- [x] All 17 HTML pages load without errors
- [x] Navigation works on all pages
- [x] Forms submit correctly
- [x] Data persists in localStorage
- [x] Redirects work properly

### **Data Integrity:**
- [x] User data saves correctly
- [x] Hospital data saves correctly
- [x] Campaign data saves correctly
- [x] Donation data saves correctly
- [x] Event data saves correctly
- [x] Session management works

---

**Documentation Complete!**  
Last Updated: January 20, 2026

