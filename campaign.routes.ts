import { Router } from 'express';
import * as campaignController from '../controllers/campaign.controller';

const router = Router();

router.post('/', campaignController.createCampaign);
router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById); // Add to controller
router.delete('/:id', campaignController.deleteCampaign); // Add to controller

export default router;