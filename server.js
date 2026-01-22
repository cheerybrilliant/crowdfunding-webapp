const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cancercare', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// ==================== SCHEMAS ====================

// User Schema
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

// Campaign Schema
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

// Donation Schema
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

// Event Schema
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

// Hospital Schema
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

// ==================== ROUTES ====================

// USER AUTHENTICATION
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, userType } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) return res.status(400).json({ error: 'User already exists' });
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user
        user = new User({
            username,
            email,
            password: hashedPassword,
            userType
        });
        
        await user.save();
        res.json({ message: 'User registered successfully', userId: user._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password' });
        
        res.json({ message: 'Login successful', userId: user._id, userType: user.userType });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DONATIONS
app.post('/api/donations', async (req, res) => {
    try {
        const { campaignId, donorId, amount, paymentMethod, phoneNumber, donorName, donorEmail } = req.body;
        
        // Validate amount
        if (amount < 500 || amount > 100000000) {
            return res.status(400).json({ error: 'Invalid donation amount' });
        }
        
        // Validate phone
        const phoneRegex = /^[6][0-9]{8}$/;
        if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
            return res.status(400).json({ error: 'Invalid Cameroon phone number' });
        }
        
        // Create donation
        const donation = new Donation({
            campaignId,
            donorId,
            amount,
            paymentMethod,
            phoneNumber,
            donorName: donorName || 'Anonymous',
            donorEmail,
            status: 'pending'
        });
        
        await donation.save();
        
        // Update campaign amount
        if (campaignId) {
            await Campaign.findByIdAndUpdate(
                campaignId,
                { $inc: { currentAmount: amount } }
            );
        }
        
        res.json({ message: 'Donation created', donationId: donation._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/donations/:donationId', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.donationId);
        if (!donation) return res.status(404).json({ error: 'Donation not found' });
        res.json(donation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/donations/campaign/:campaignId', async (req, res) => {
    try {
        const donations = await Donation.find({ campaignId: req.params.campaignId });
        res.json(donations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CAMPAIGNS
app.post('/api/campaigns', async (req, res) => {
    try {
        const { patientName, story, targetAmount, hospitalPartner } = req.body;
        
        const campaign = new Campaign({
            patientName,
            story,
            targetAmount,
            hospitalPartner,
            status: 'active',
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
        });
        
        await campaign.save();
        res.json({ message: 'Campaign created', campaignId: campaign._id, campaign });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/campaigns', async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'active' });
        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/campaigns/:campaignId', async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        res.json(campaign);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/campaigns/:campaignId', async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndUpdate(
            req.params.campaignId,
            req.body,
            { new: true }
        );
        res.json({ message: 'Campaign updated', campaign });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// EVENTS
app.post('/api/events', async (req, res) => {
    try {
        const { title, description, date, location, organizer, category } = req.body;
        
        const event = new Event({
            title,
            description,
            date,
            location,
            organizer,
            category
        });
        
        await event.save();
        res.json({ message: 'Event created', eventId: event._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/events/:eventId/attend', async (req, res) => {
    try {
        const { userId } = req.body;
        
        const event = await Event.findByIdAndUpdate(
            req.params.eventId,
            { $addToSet: { attendees: userId } },
            { new: true }
        );
        
        res.json({ message: 'Attendance registered', event });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// HOSPITALS
app.post('/api/hospitals', async (req, res) => {
    try {
        const { name, location, phone, email, specialization } = req.body;
        
        const hospital = new Hospital({
            name,
            location,
            phone,
            email,
            specialization,
            verificationStatus: 'pending'
        });
        
        await hospital.save();
        res.json({ message: 'Hospital registered', hospitalId: hospital._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/hospitals', async (req, res) => {
    try {
        const hospitals = await Hospital.find({ verificationStatus: 'verified' });
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// STATS
app.get('/api/stats', async (req, res) => {
    try {
        const totalDonations = await Donation.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const totalDonors = await Donation.distinct('donorId');
        const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
        const hospitals = await Hospital.countDocuments({ verificationStatus: 'verified' });
        
        res.json({
            totalDonations: totalDonations[0]?.total || 0,
            totalDonors: totalDonors.length,
            activeCampaigns,
            hospitals
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
