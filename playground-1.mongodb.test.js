// Tests for MongoDB playground queries
describe('Account Creation Queries', () => {
    let db;

    beforeEach(() => {
        // Setup: Insert test data
        db.getCollection('create account').insertMany([
            { 'username': 'cheery', 'password': 'password123', 'account_type': 'donor', 'date': new Date('2026-03-01T08:00:00Z') },
            { 'username': 'jkl', 'password': 'password456', 'account_type': 'donor', 'date': new Date('2026-03-01T09:00:00Z') },
            { 'username': 'xyz', 'password': 'password789', 'account_type': 'patient', 'date': new Date('2026-04-04T11:21:39.736Z') },
            { 'username': 'abc', 'password': 'passwordabc', 'account_type': 'patient', 'date': new Date('2026-04-04T21:23:13.331Z') },
        ]);
    });

    test('should find accounts created on April 4th, 2026', () => {
        const create4th = db.getCollection('create account').find({
            date: { $gte: new Date('2026-04-04'), $lt: new Date('2026-04-05') }
        }).count();
        
        expect(create4th).toBe(2);
    });

    test('should group accounts by username and count them', () => {
        const result = db.getCollection('create account').aggregate([
            { $match: { date: { $gte: new Date('2026-01-01'), $lt: new Date('2027-01-01') } } },
            { $group: { _id: '$username', totalAccounts: { $sum: 1 }, accountTypes: { $push: '$account_type' } } }
        ]).toArray();
        
        expect(result.length).toBeGreaterThan(0);
        expect(result.some(doc => doc._id === 'abc')).toBe(true);
    });

    afterEach(() => {
        // Cleanup: Remove test data
        db.getCollection('create account').deleteMany({});
    });
});

describe('Payment Integration Tests', () => {
    let db;

    beforeEach(() => {
        db.getCollection('campaigns').insertMany([
            { '_id': 'camp1', 'title': 'Medical Emergency', 'creator': 'xyz', 'goal': 5000, 'raised': 2500, 'status': 'active' },
            { '_id': 'camp2', 'title': 'Education Fund', 'creator': 'abc', 'goal': 3000, 'raised': 1000, 'status': 'active' }
        ]);
        db.getCollection('donations').insertMany([
            { 'donorId': 'cheery', 'campaignId': 'camp1', 'amount': 500, 'paymentMethod': 'mobilemoney', 'status': 'completed', 'date': new Date('2026-04-04T10:00:00Z') },
            { 'donorId': 'jkl', 'campaignId': 'camp1', 'amount': 750, 'paymentMethod': 'orangemoney', 'status': 'completed', 'date': new Date('2026-04-04T11:00:00Z') }
        ]);
    });

    test('should retrieve all donations for a campaign', () => {
        const donations = db.getCollection('donations').find({ campaignId: 'camp1' }).toArray();
        expect(donations.length).toBe(2);
        expect(donations.every(d => ['mobilemoney', 'orangemoney'].includes(d.paymentMethod))).toBe(true);
    });

    test('should calculate total raised by payment method', () => {
        const result = db.getCollection('donations').aggregate([
            { $group: { _id: '$paymentMethod', totalRaised: { $sum: '$amount' } } }
        ]).toArray();
        expect(result.length).toBeGreaterThan(0);
    });

    afterEach(() => {
        db.getCollection('campaigns').deleteMany({});
        db.getCollection('donations').deleteMany({});
    });
});