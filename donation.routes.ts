import { Router } from 'express';
import * as donationController from '../controllers/donation.controller';

const router = Router();

router.post('/', donationController.createDonation);
router.post('/webhook', donationController.webhook);

export default router;