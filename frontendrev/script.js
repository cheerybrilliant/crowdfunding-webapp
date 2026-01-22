// Common JavaScript Functions for Crowdfunding Platform

// Security: XSS Protection - Sanitize HTML input
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Security: Validate and sanitize all user inputs
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    // Remove any HTML tags and dangerous characters
    return input.replace(/[<>\"']/g, '').trim();
}

// Function to show alert messages (XSS protected)
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message; // textContent already prevents XSS

    // Insert at the top of the container
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);

        // Remove alert after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Function to validate email
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Function to validate password with strong security requirements
function validatePassword(password) {
    // Must be at least 8 characters
    if (password.length < 8) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long'
        };
    }

    // Must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one uppercase letter'
        };
    }

    // Must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one lowercase letter'
        };
    }

    // Must contain at least one number
    if (!/[0-9]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one number'
        };
    }

    // Must contain at least one special symbol
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one special character (!@#$%^&*)'
        };
    }

    return {
        isValid: true,
        message: 'Password is strong'
    };
}

// Security: Generate secure session token
function generateSecureToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Security: Hash password (educational implementation - use bcrypt in production)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
}

// Security: Store user credentials securely
// Load user database from localStorage
function getUserDatabase() {
    const db = localStorage.getItem('userDatabase');
    if (!db) return [];

    try {
        const parsed = JSON.parse(db);
        // Handle both old object format and new array format
        if (Array.isArray(parsed)) {
            return parsed;
        } else {
            // Convert old object format to array format
            const users = [];
            for (const email in parsed) {
                if (parsed.hasOwnProperty(email)) {
                    users.push({
                        email: email,
                        passwordHash: parsed[email].passwordHash,
                        ...parsed[email].userData
                    });
                }
            }
            // Save in new format
            localStorage.setItem('userDatabase', JSON.stringify(users));
            return users;
        }
    } catch (e) {
        return [];
    }
}

// Function to save user data to localStorage with security
function saveUserData(userData) {
    // Sanitize all user inputs
    const sanitizedData = {
        fullName: sanitizeInput(userData.fullName),
        email: sanitizeInput(userData.email),
        phone: sanitizeInput(userData.phone || ''),
        accountType: sanitizeInput(userData.accountType),
        userType: sanitizeInput(userData.userType || userData.accountType),
        verified: userData.verified,
        sessionToken: generateSecureToken(),
        registrationDate: new Date().toISOString()
    };

    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(sanitizedData));

    // Store credentials in persistent database (array format)
    if (userData.password) {
        const userDatabase = getUserDatabase();

        // Check if user already exists
        const existingIndex = userDatabase.findIndex(u => u.email === sanitizedData.email);

        const userRecord = {
            ...sanitizedData,
            passwordHash: hashPassword(userData.password)
        };

        if (existingIndex >= 0) {
            // Update existing user
            userDatabase[existingIndex] = userRecord;
        } else {
            // Add new user
            userDatabase.push(userRecord);
        }

        localStorage.setItem('userDatabase', JSON.stringify(userDatabase));
    }
}

// Function to get current user data with validation
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return null;

    try {
        const user = JSON.parse(userData);
        // Validate session token exists
        if (!user.sessionToken) {
            localStorage.removeItem('currentUser');
            return null;
        }
        return user;
    } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('currentUser');
        return null;
    }
}

// Function to logout user
function logoutUser() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('hospitalSession');
    window.location.href = 'index.html';
}

// Function to check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Security: Rate limiting for form submissions
const rateLimiter = {
    attempts: {},
    maxAttempts: 5,
    timeWindow: 60000, // 1 minute

    checkLimit: function(action) {
        const now = Date.now();
        if (!this.attempts[action]) {
            this.attempts[action] = [];
        }

        // Remove old attempts outside time window
        this.attempts[action] = this.attempts[action].filter(
            time => now - time < this.timeWindow
        );

        // Check if limit exceeded
        if (this.attempts[action].length >= this.maxAttempts) {
            return false;
        }

        // Record this attempt
        this.attempts[action].push(now);
        return true;
    },

    getRemainingTime: function(action) {
        if (!this.attempts[action] || this.attempts[action].length === 0) {
            return 0;
        }
        const oldestAttempt = Math.min(...this.attempts[action]);
        const remainingMs = this.timeWindow - (Date.now() - oldestAttempt);
        return Math.ceil(remainingMs / 1000);
    }
};

// Security: Hospital authentication with secure credentials
// Hospitals must register through hospital-register.html
// Credentials are stored in localStorage after registration
function getHospitalCredentials() {
    return JSON.parse(localStorage.getItem('hospitalCredentials') || '{}');
}

// Function to validate hospital login
function validateHospitalLogin(hospitalId, password) {
    // Rate limiting
    if (!rateLimiter.checkLimit('hospitalLogin')) {
        const remainingTime = rateLimiter.getRemainingTime('hospitalLogin');
        throw new Error(`Too many login attempts. Please wait ${remainingTime} seconds.`);
    }

    // Check if hospital exists in registered hospitals
    const hospitals = JSON.parse(localStorage.getItem('hospitals') || '[]');
    const hospital = hospitals.find(h => h.hospitalId === hospitalId);

    if (!hospital) {
        return false;
    }

    // Check if hospital is approved
    if (hospital.status !== 'active') {
        throw new Error('Your hospital account is pending admin approval. Please wait for confirmation email.');
    }

    const passwordHash = hashPassword(password);
    return passwordHash === hospital.password;
}

// Function to create hospital session
function createHospitalSession(hospitalId) {
    const hospitalCredentials = getHospitalCredentials();
    const hospital = hospitalCredentials[hospitalId];
    if (!hospital) return false;

    const session = {
        hospitalId: hospitalId,
        hospitalName: hospital.hospitalName,
        sessionToken: generateSecureToken(),
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    };

    localStorage.setItem('hospitalSession', JSON.stringify(session));
    return true;
}

// Function to validate hospital session
function validateHospitalSession() {
    const sessionData = localStorage.getItem('hospitalSession');
    if (!sessionData) return false;

    try {
        const session = JSON.parse(sessionData);
        const expiresAt = new Date(session.expiresAt);

        // Check if session expired
        if (new Date() > expiresAt) {
            localStorage.removeItem('hospitalSession');
            return false;
        }

        return session;
    } catch (e) {
        localStorage.removeItem('hospitalSession');
        return false;
    }
}

// Function to update progress bar
function updateProgressBar(current, goal) {
    const percentage = Math.min((current / goal) * 100, 100);
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    return percentage.toFixed(1);
}

// Function to format currency
function formatCurrency(amount) {
    return 'XAF ' + amount.toLocaleString();
}

// Sample campaign data (in a real app, this would come from a database)
const sampleCampaigns = [
    {
        id: 1,
        patientName: 'Little Emma Tanko',
        age: 7,
        patientType: 'child',
        story: 'Emma is a 7-year-old girl diagnosed with leukemia. She needs urgent chemotherapy treatment.',
        fullStory: 'Emma Tanko is a bright and cheerful 7-year-old girl who loves to draw and play with her friends. Three months ago, Emma was diagnosed with acute lymphoblastic leukemia. Her parents, who work as small business owners, are struggling to afford the intensive chemotherapy treatment she needs. Emma has already started treatment at Yaoundé General Hospital, but the costs are overwhelming. The doctors say Emma has a good chance of recovery with proper treatment. Your support will help Emma get the life-saving treatment she needs to beat cancer and return to being the happy child she was.',
        goalAmount: 8000000,
        raisedAmount: 0,
        image: 'patient1.jpg',
        verified: true
    },
    {
        id: 2,
        patientName: 'Samuel Ndi',
        age: 12,
        patientType: 'child',
        story: 'Samuel is a 12-year-old boy fighting brain cancer. He needs surgery and radiation therapy.',
        fullStory: 'Samuel Ndi is a smart 12-year-old boy who dreams of becoming a doctor one day. Six months ago, Samuel started experiencing severe headaches and vision problems. After several tests, he was diagnosed with a brain tumor. Samuel needs urgent surgery followed by radiation therapy. His family has sold everything they could to pay for the initial diagnosis and tests, but they cannot afford the surgery. Samuel is a fighter with a bright future ahead of him. With your help, we can give Samuel the chance to achieve his dreams and live a full life.',
        goalAmount: 12000000,
        raisedAmount: 0,
        image: 'patient2.jpg',
        verified: true
    },
    {
        id: 3,
        patientName: 'Marie Kouam',
        age: 45,
        patientType: 'adult',
        story: 'Marie is a 45-year-old mother of three diagnosed with breast cancer. She needs chemotherapy treatment.',
        fullStory: 'Marie Kouam is a 45-year-old mother of three beautiful children. She has always been the pillar of her family, working hard as a teacher to provide for her loved ones. Six months ago, Marie was diagnosed with stage 2 breast cancer. The diagnosis came as a shock to her and her family. Marie needs chemotherapy and radiation treatment, but the costs are overwhelming. She has already spent her savings on initial tests and consultations. Your support will help Marie get the treatment she desperately needs to fight this disease and return to her children.',
        goalAmount: 5000000,
        raisedAmount: 0,
        image: 'patient3.jpg',
        verified: true
    },
    {
        id: 4,
        patientName: 'Jean Mballa',
        age: 52,
        patientType: 'adult',
        story: 'Jean is a 52-year-old father fighting lung cancer. He needs support for his ongoing treatment.',
        fullStory: 'Jean Mballa is a 52-year-old father and dedicated community worker who has spent his life helping others. Recently diagnosed with lung cancer, Jean now needs the community\'s support. He requires surgery and chemotherapy treatments that his family cannot afford. Jean has always been there for others, and now it\'s our turn to be there for him. Every donation, no matter how small, will make a difference in Jean\'s fight against cancer.',
        goalAmount: 7500000,
        raisedAmount: 0,
        image: 'patient4.jpg',
        verified: true
    },
    {
        id: 5,
        patientName: 'Grace Nkeng',
        age: 38,
        patientType: 'adult',
        story: 'Grace is a 38-year-old woman battling ovarian cancer. She needs help to continue her treatment.',
        fullStory: 'Grace Nkeng is a vibrant 38-year-old woman who loves life and her family. She was diagnosed with ovarian cancer last year and has been fighting bravely ever since. Grace has undergone surgery but still needs several rounds of chemotherapy. The medical bills are mounting, and her family has exhausted their resources. Grace remains positive and hopeful, but she needs our help to continue her treatment. Your donation will give Grace the chance to beat cancer and return to the life she loves.',
        goalAmount: 6000000,
        raisedAmount: 0,
        image: 'patient5.jpg',
        verified: true
    }
];

// Sample events data with funding goals
const sampleEvents = [
    {
        id: 1,
        title: 'Cancer Awareness Seminar',
        date: '2026-02-15',
        type: 'Seminar',
        description: 'Join us for an educational seminar about cancer prevention and early detection.',
        fullDescription: 'A comprehensive seminar covering cancer prevention strategies, early detection methods, and treatment options. Expert oncologists from Yaoundé General Hospital will share their knowledge. Includes free educational materials and refreshments.',
        goalAmount: 500000,
        raisedAmount: 0,
        location: 'Yaoundé General Hospital Conference Hall',
        capacity: 200,
        needsFunding: true
    },
    {
        id: 2,
        title: 'Free Health Screening',
        date: '2026-02-28',
        type: 'Health Gathering',
        description: 'Free cancer screening and health checkups for the community.',
        fullDescription: 'Free cancer screening event providing basic health checkups, blood tests, and cancer screening services to the community. Medical professionals will be available for consultations. All services are completely free.',
        goalAmount: 1200000,
        raisedAmount: 0,
        location: 'Yaoundé Central Hospital',
        capacity: 500,
        needsFunding: true
    },
    {
        id: 3,
        title: 'Support Group Meeting',
        date: '2026-03-10',
        type: 'Health Gathering',
        description: 'Monthly support group meeting for cancer patients and their families.',
        fullDescription: 'A safe space for cancer patients and their families to share experiences, receive emotional support, and connect with others facing similar challenges. Professional counselors will be present.',
        goalAmount: 200000,
        raisedAmount: 0,
        location: 'CancerCare Community Center',
        capacity: 50,
        needsFunding: true
    }
];

// Function to load events from localStorage
function loadEvents() {
    // Force reset to fresh events with 0 donations
    saveEvents(sampleEvents);
    return sampleEvents;
}

// Function to save events to localStorage
function saveEvents(events) {
    localStorage.setItem('events', JSON.stringify(events));
}

// Function to donate to an event
function donateToEvent(eventId, amount) {
    const events = loadEvents();
    const event = events.find(e => e.id === eventId);

    if (event) {
        event.raisedAmount += amount;
        if (event.raisedAmount >= event.goalAmount) {
            event.needsFunding = false;
        }
        saveEvents(events);
        return true;
    }
    return false;
}

// Partner Hospitals in Yaoundé
const partnerHospitals = [
    {
        id: 1,
        name: 'CHU Hospital Yaoundé',
        location: 'Total Energies Melen 1, Yaoundé',
        phone: '+237 680 480 725',
        services: 'Oncology Department, Cancer Screening, Patient Verification, Chemotherapy',
        verified: true
    }
];

// Function to get campaign by ID
function getCampaignById(id) {
    return sampleCampaigns.find(campaign => campaign.id === parseInt(id));
}

// Security: Protect campaign data with checksum
function generateChecksum(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return hash.toString(16);
}

// Function to save campaigns to localStorage with integrity check
function saveCampaigns(campaigns = sampleCampaigns) {
    const checksum = generateChecksum(campaigns);
    const secureData = {
        campaigns: campaigns,
        checksum: checksum,
        lastModified: new Date().toISOString()
    };
    localStorage.setItem('campaigns', JSON.stringify(secureData));
}

// Function to load campaigns from localStorage with validation
function loadCampaigns() {
    const data = localStorage.getItem('campaigns');
    if (!data) return sampleCampaigns;

    try {
        const parsed = JSON.parse(data);
        // Verify data integrity
        if (parsed.campaigns && parsed.checksum) {
            const expectedChecksum = generateChecksum(parsed.campaigns);
            if (expectedChecksum === parsed.checksum) {
                return parsed.campaigns;
            } else {
                console.warn('Data integrity check failed! Resetting campaigns.');
                saveCampaigns();
                return sampleCampaigns;
            }
        }
        return sampleCampaigns;
    } catch (e) {
        console.error('Error loading campaigns:', e);
        return sampleCampaigns;
    }
}

// Initialize campaigns in localStorage if not exists
if (!localStorage.getItem('campaigns')) {
    saveCampaigns();
}

// Security: Prevent console manipulation
(function() {
    // Detect if developer tools are open
    let devtoolsOpen = false;
    const threshold = 160;

    setInterval(function() {
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
            devtoolsOpen = true;
        } else {
            devtoolsOpen = false;
        }
    }, 1000);

    // Override console methods to warn about manipulation
    const originalLog = console.log;
    console.log = function(...args) {
        if (devtoolsOpen) {
            originalLog.apply(console, ['⚠️ WARNING: Manipulating data through console is prohibited and will be logged.']);
        }
        originalLog.apply(console, args);
    };

    // Protect critical functions from being overridden (only if they exist)
    if (typeof saveCampaigns !== 'undefined') Object.freeze(saveCampaigns);
    if (typeof loadCampaigns !== 'undefined') Object.freeze(loadCampaigns);
    if (typeof validatePassword !== 'undefined') Object.freeze(validatePassword);
    if (typeof validateHospitalLogin !== 'undefined') Object.freeze(validateHospitalLogin);
    if (typeof sanitizeInput !== 'undefined') Object.freeze(sanitizeInput);
    if (typeof sanitizeHTML !== 'undefined') Object.freeze(sanitizeHTML);
})();

// Security: Validate campaign data integrity on page load
window.addEventListener('load', function() {
    const campaigns = loadCampaigns();
    let isValid = true;

    campaigns.forEach(campaign => {
        // Check for negative or unrealistic values
        if (campaign.raisedAmount < 0 || campaign.raisedAmount > campaign.goalAmount * 2) {
            isValid = false;
        }
        if (campaign.goalAmount < 0 || campaign.goalAmount > 1000000000) {
            isValid = false;
        }
    });

    if (!isValid) {
        console.warn('Campaign data validation failed. Resetting to defaults.');
        saveCampaigns();
    }
});

