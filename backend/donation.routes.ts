import { Router } from 'express';
import * as donationController from './donation.controller';

const router = Router();

router.post('/', donationController.createDonation);
router.get('/', donationController.getDonations);
router.get('/campaign/:campaignId', donationController.getCampaignDonations);
router.get('/user/:userId', donationController.getUserDonations);
router.get('/:donationId/mtn-status', donationController.checkMTNPaymentStatus);
router.get('/:id', donationController.getDonation);
 

export default router;
