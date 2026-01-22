/**
 * PLAYGROUND: Real Examples for CancerCare Platform
 * 
 * This file demonstrates all API endpoints with realistic data
 * Run with: node playground.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cancercare', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', () => {
    console.error('MongoDB connection error');
    process.exit(1);
});

db.once('open', async () => {
    console.log('✓ MongoDB connected\n');
    await runPlayground();
    process.exit(0);
});

// ==================== SCHEMAS ====================

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['donor', 'patient', 'hospital'], default: 'donor' },
    phone: String,
    hospitalName: String,
    hospitalVerification: Boolean,
    createdAt: { type: Date, default: Date.now },
});

const campaignSchema = new mongoose.Schema({
    patientName: String,
    patientId: mongoose.Schema.Types.ObjectId,
    story: String,
    targetAmount: Number,
    currentAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed', 'closed'], default: 'active' },
    image: String,
    hospitalPartner: String,
    endDate: Date,
    createdAt: { type: Date, default: Date.now },
});

const donationSchema = new mongoose.Schema({
    campaignId: mongoose.Schema.Types.ObjectId,
    donorId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    paymentMethod: { type: String, enum: ['mtn', 'orange'], required: true },
    phoneNumber: String,
    donorName: String,
    donorEmail: String,
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: String,
    createdAt: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: Date,
    location: String,
    organizer: String,
    category: { type: String, enum: ['seminar', 'awareness', 'medical_gathering'], default: 'seminar' },
    attendees: [mongoose.Schema.Types.ObjectId],
    createdAt: { type: Date, default: Date.now },
});

const hospitalSchema = new mongoose.Schema({
    name: String,
    location: String,
    phone: String,
    email: String,
    specialization: [String],
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

// Models
const User = mongoose.model('User', userSchema);
const Campaign = mongoose.model('Campaign', campaignSchema);
const Donation = mongoose.model('Donation', donationSchema);
const Event = mongoose.model('Event', eventSchema);
const Hospital = mongoose.model('Hospital', hospitalSchema);

// ==================== PLAYGROUND EXAMPLES ====================

async function runPlayground() {
    console.log('🎮 CANCERCARE PLATFORM - API PLAYGROUND\n');
    console.log('========================================\n');

    try {
        // Clear collections for fresh examples
        console.log('📝 Clearing database for fresh examples...\n');
        await User.deleteMany({});
        await Campaign.deleteMany({});
        await Donation.deleteMany({});
        await Event.deleteMany({});
        await Hospital.deleteMany({});

        // ==================== EXAMPLE 1: USER REGISTRATION & LOGIN ====================
        console.log('📌 EXAMPLE 1: User Registration & Authentication\n');

        const donor = await User.create({
            username: 'john_donor',
            email: 'john@example.com',
            password: 'hashed_password_123',
            userType: 'donor',
            phone: '237680123456'
        });
        console.log('✓ Donor registered:', donor.email);

        const patient = await User.create({
            username: 'marie_patient',
            email: 'marie@example.com',
            password: 'hashed_password_456',
            userType: 'patient',
            phone: '237681234567'
        });
        console.log('✓ Patient registered:', patient.email);

        const hospital = await User.create({
            username: 'yaoundé_hospital',
            email: 'hospital@yaoundé.cm',
            password: 'hashed_password_789',
            userType: 'hospital',
            hospitalName: 'Yaoundé Central Hospital'
        });
        console.log('✓ Hospital registered:', hospital.hospitalName);
        console.log();

        // ==================== EXAMPLE 2: HOSPITAL REGISTRATION ====================
        console.log('📌 EXAMPLE 2: Hospital Partnership Registration\n');

        const centreHospital = await Hospital.create({
            name: 'Yaoundé Central Hospital',
            location: 'Yaoundé, Cameroon',
            phone: '+237 222 234 567',
            email: 'contact@yaoundé-central.cm',
            specialization: ['Oncology', 'Chemotherapy', 'Radiotherapy'],
            verificationStatus: 'verified'
        });
        console.log('✓ Hospital registered:', centreHospital.name);
        console.log('  Location:', centreHospital.location);
        console.log('  Specializations:', centreHospital.specialization.join(', '));

        const sinaiHospital = await Hospital.create({
            name: 'Mount Sinai Medical Center',
            location: 'Douala, Cameroon',
            phone: '+237 233 345 678',
            email: 'info@mountsinai.cm',
            specialization: ['General Surgery', 'Oncology'],
            verificationStatus: 'verified'
        });
        console.log('✓ Hospital registered:', sinaiHospital.name);
        console.log();

        // ==================== EXAMPLE 3: CREATE CAMPAIGNS ====================
        console.log('📌 EXAMPLE 3: Create Patient Campaigns\n');

        const campaign1 = await Campaign.create({
            patientName: 'Marie Kenfack',
            patientId: patient._id,
            story: 'Marie is a 34-year-old mother of two diagnosed with stage 2 breast cancer. She needs chemotherapy treatment and support for her family during recovery.',
            targetAmount: 2000000,
            currentAmount: 0,
            hospitalPartner: centreHospital.name,
            status: 'active',
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        });
        console.log('✓ Campaign created for:', campaign1.patientName);
        console.log('  Target: XAF', campaign1.targetAmount.toLocaleString());
        console.log('  Partner Hospital:', campaign1.hospitalPartner);

        const campaign2 = await Campaign.create({
            patientName: 'Emmanuel Ngono',
            story: 'Emmanuel is a 45-year-old businessman fighting colorectal cancer. He requires ongoing chemotherapy and nutritional support.',
            targetAmount: 3000000,
            currentAmount: 0,
            hospitalPartner: sinaiHospital.name,
            status: 'active',
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        });
        console.log('✓ Campaign created for:', campaign2.patientName);
        console.log('  Target: XAF', campaign2.targetAmount.toLocaleString());
        console.log();

        // ==================== EXAMPLE 4: CREATE DONATIONS ====================
        console.log('📌 EXAMPLE 4: Process Donations\n');

        const donation1 = await Donation.create({
            campaignId: campaign1._id,
            donorId: donor._id,
            amount: 500000,
            paymentMethod: 'mtn',
            phoneNumber: '237680123456',
            donorName: 'John Doe',
            donorEmail: 'john@example.com',
            status: 'completed',
            transactionId: 'TXN_001_2026'
        });
        console.log('✓ Donation processed');
        console.log('  Donor:', donation1.donorName);
        console.log('  Amount: XAF', donation1.amount.toLocaleString());
        console.log('  Method:', donation1.paymentMethod.toUpperCase());
        console.log('  Transaction ID:', donation1.transactionId);

        const donation2 = await Donation.create({
            campaignId: campaign1._id,
            donorId: null,
            amount: 250000,
            paymentMethod: 'orange',
            phoneNumber: '237690987654',
            donorName: 'Anonymous',
            donorEmail: 'anonymous@example.com',
            status: 'completed',
            transactionId: 'TXN_002_2026'
        });
        console.log('✓ Anonymous donation processed');
        console.log('  Amount: XAF', donation2.amount.toLocaleString());
        console.log('  Payment Method:', donation2.paymentMethod.toUpperCase());

        const donation3 = await Donation.create({
            campaignId: campaign2._id,
            donorId: donor._id,
            amount: 1000000,
            paymentMethod: 'mtn',
            phoneNumber: '237680123456',
            donorName: 'John Doe',
            donorEmail: 'john@example.com',
            status: 'completed',
            transactionId: 'TXN_003_2026'
        });
        console.log('✓ Another donation processed');
        console.log('  Amount: XAF', donation3.amount.toLocaleString());
        console.log();

        // Update campaign amounts
        await Campaign.findByIdAndUpdate(campaign1._id, {
            currentAmount: 750000
        });
        await Campaign.findByIdAndUpdate(campaign2._id, {
            currentAmount: 1000000
        });

        // ==================== EXAMPLE 5: RETRIEVE CAMPAIGN DATA ====================
        console.log('📌 EXAMPLE 5: Campaign Progress Tracking\n');

        const updatedCampaign1 = await Campaign.findById(campaign1._id);
        const progress1 = (updatedCampaign1.currentAmount / updatedCampaign1.targetAmount * 100).toFixed(1);
        console.log(`Campaign: ${updatedCampaign1.patientName}`);
        console.log(`  Status: ${updatedCampaign1.status.toUpperCase()}`);
        console.log(`  Raised: XAF ${updatedCampaign1.currentAmount.toLocaleString()} / XAF ${updatedCampaign1.targetAmount.toLocaleString()}`);
        console.log(`  Progress: ${progress1}%`);
        console.log();

        // ==================== EXAMPLE 6: CREATE EVENTS ====================
        console.log('📌 EXAMPLE 6: Health Awareness Events\n');

        const event1 = await Event.create({
            title: 'Breast Cancer Awareness Seminar',
            description: 'Learn about breast cancer prevention, early detection, and treatment options with expert medical professionals.',
            date: new Date('2026-02-15T10:00:00'),
            location: 'Yaoundé Conference Center',
            organizer: centreHospital.name,
            category: 'seminar'
        });
        console.log('✓ Event created:', event1.title);
        console.log('  Date:', event1.date.toLocaleDateString('en-CM'));
        console.log('  Location:', event1.location);
        console.log('  Organizer:', event1.organizer);

        const event2 = await Event.create({
            title: 'Cancer Prevention & Healthy Living Workshop',
            description: 'Interactive workshop covering nutrition, exercise, and lifestyle modifications for cancer prevention.',
            date: new Date('2026-03-01T14:00:00'),
            location: 'Douala Community Center',
            organizer: sinaiHospital.name,
            category: 'awareness'
        });
        console.log('✓ Event created:', event2.title);
        console.log('  Date:', event2.date.toLocaleDateString('en-CM'));
        console.log();

        // ==================== EXAMPLE 7: STATISTICS & DASHBOARD ====================
        console.log('📌 EXAMPLE 7: Platform Statistics\n');

        const totalDonations = await Donation.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const uniqueDonors = await Donation.distinct('donorId');
        const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
        const verifiedHospitals = await Hospital.countDocuments({ verificationStatus: 'verified' });
        const totalDonationCount = await Donation.countDocuments({ status: 'completed' });

        console.log('Platform Overview:');
        console.log('  Total Donations: XAF', (totalDonations[0]?.total || 0).toLocaleString());
        console.log('  Number of Completed Transactions:', totalDonationCount);
        console.log('  Unique Donors: ~', uniqueDonors.length);
        console.log('  Active Campaigns:', activeCampaigns);
        console.log('  Verified Partner Hospitals:', verifiedHospitals);
        console.log();

        // ==================== EXAMPLE 8: CAMPAIGN DONATIONS DETAILS ====================
        console.log('📌 EXAMPLE 8: Campaign Donation History\n');

        const campaignDonations = await Donation.find({ campaignId: campaign1._id });
        console.log(`Donations to "${campaign1.patientName}" campaign:`);
        campaignDonations.forEach((donation, index) => {
            console.log(`  ${index + 1}. ${donation.donorName} - XAF ${donation.amount.toLocaleString()} (${donation.paymentMethod})`);
        });
        console.log();

        // ==================== SUMMARY ====================
        console.log('========================================\n');
        console.log('✅ PLAYGROUND EXAMPLES COMPLETED!\n');
        console.log('📊 Database Summary:');
        console.log(`   • ${await User.countDocuments()} users created`);
        console.log(`   • ${await Campaign.countDocuments()} campaigns created`);
        console.log(`   • ${await Donation.countDocuments()} donations processed`);
        console.log(`   • ${await Event.countDocuments()} events scheduled`);
        console.log(`   • ${await Hospital.countDocuments()} hospitals registered`);
        console.log();
        console.log('🚀 Next Steps:');
        console.log('   1. Install dependencies: npm install');
        console.log('   2. Start backend: npm start (or npm run dev)');
        console.log('   3. Connect frontend by including config.js in HTML files');
        console.log('   4. Update HTML forms to use api.* methods\n');

    } catch (error) {
        console.error('❌ Playground Error:', error.message);
    }
}
