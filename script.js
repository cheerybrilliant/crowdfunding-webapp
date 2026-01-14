// Common JavaScript Functions for Crowdfunding Platform

// Function to show alert messages
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
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

// Function to validate password (minimum 6 characters)
function validatePassword(password) {
    return password.length >= 6;
}

// Function to save user data to localStorage
function saveUserData(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
}

// Function to get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Function to logout user
function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Function to check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
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

// Sample events data
const sampleEvents = [
    {
        id: 1,
        title: 'Cancer Awareness Seminar',
        date: '2026-02-15',
        type: 'Seminar',
        description: 'Join us for an educational seminar about cancer prevention and early detection.'
    },
    {
        id: 2,
        title: 'Free Health Screening',
        date: '2026-02-28',
        type: 'Health Gathering',
        description: 'Free cancer screening and health checkups for the community.'
    },
    {
        id: 3,
        title: 'Support Group Meeting',
        date: '2026-03-10',
        type: 'Health Gathering',
        description: 'Monthly support group meeting for cancer patients and their families.'
    }
];

// Partner Hospitals in Yaoundé
const partnerHospitals = [
    {
        id: 1,
        name: 'Yaoundé General Hospital',
        location: 'Centre Ville, Yaoundé',
        phone: '+237 222 23 40 20',
        services: 'Oncology Department, Chemotherapy, Radiation Therapy',
        verified: true
    },
    {
        id: 2,
        name: 'Yaoundé Central Hospital',
        location: 'Tsinga, Yaoundé',
        phone: '+237 222 20 10 29',
        services: 'Cancer Screening, Surgery, Patient Support',
        verified: true
    },
    {
        id: 3,
        name: 'Yaoundé University Teaching Hospital',
        location: 'Ngoa-Ekelle, Yaoundé',
        phone: '+237 222 23 15 80',
        services: 'Advanced Cancer Treatment, Research, Clinical Trials',
        verified: true
    },
    {
        id: 4,
        name: 'Centre Hospitalier d\'Essos',
        location: 'Essos, Yaoundé',
        phone: '+237 222 21 30 45',
        services: 'Oncology Consultation, Diagnostic Services',
        verified: true
    },
    {
        id: 5,
        name: 'Hôpital de District de Biyem-Assi',
        location: 'Biyem-Assi, Yaoundé',
        phone: '+237 222 22 50 67',
        services: 'Primary Cancer Care, Patient Verification',
        verified: true
    }
];

// Function to get campaign by ID
function getCampaignById(id) {
    return sampleCampaigns.find(campaign => campaign.id === parseInt(id));
}

// Function to save campaigns to localStorage
function saveCampaigns() {
    localStorage.setItem('campaigns', JSON.stringify(sampleCampaigns));
}

// Function to load campaigns from localStorage
function loadCampaigns() {
    const campaigns = localStorage.getItem('campaigns');
    return campaigns ? JSON.parse(campaigns) : sampleCampaigns;
}

// Initialize campaigns in localStorage if not exists
if (!localStorage.getItem('campaigns')) {
    saveCampaigns();
}

// Force reset campaigns to zero - Remove this after first load if needed
// This will reset all campaigns to have 0 raised amount
function resetCampaignsToZero() {
    localStorage.setItem('campaigns', JSON.stringify(sampleCampaigns));
}

// Call this once to reset all campaigns to zero
resetCampaignsToZero();

