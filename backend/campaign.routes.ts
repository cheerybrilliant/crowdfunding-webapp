import { Router } from 'express';
import * as campaignController from './campaign.controllers';

const router = Router();

router.post('/', campaignController.createCampaign);
router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

export default router;