import { Router } from 'express';
import * as donationController from './donation.controller';

const router = Router();

router.post('/', donationController.createDonation);
router.get('/:id', donationController.getDonation);
router.get('/:donationId/mtn-status', donationController.checkMTNPaymentStatus);
router.get('/campaign/:campaignId', donationController.getCampaignDonations);
 

export default router;