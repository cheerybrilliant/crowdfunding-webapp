import { Request, Response } from 'express';
import * as campaignService from './campaign.service';
import { auth } from './auth.middleware';
import { validate } from './validate.middleware';
import Joi from 'joi';

const campaignSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  goalAmount: Joi.number().required(),
  patientName: Joi.string().required(),
  patientAge: Joi.number(),
  hospitalName: Joi.string().required(),
});

export const createCampaign = [
  auth,
  validate(campaignSchema),
  async (req: Request, res: Response) => {
    try {
      const campaign = await campaignService.createCampaign({
        ...req.body,
        patientId: (req as any).user?.id,
      });
      res.status(201).json(campaign);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
];

export const getCampaigns = async (_: Request, res: Response) => {
  try {
    const campaigns = await campaignService.getCampaigns();
    res.json(campaigns);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCampaignById = async (_req: Request, _res: Response) => {
  try {
    const { id } = _req.params;
    const campaign = await campaignService.getCampaignById(id);

    if (!campaign) {
      return _res.status(404).json({ message: 'Campaign not found' });
    }

    return _res.json(campaign);
  } catch (err: any) {
    return _res.status(500).json({ message: err.message });
  }
};

export const updateCampaign = [
  auth,
  validate(campaignSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const campaign = await campaignService.getCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      const userId = (req as any).user?.id;
      if (!userId || campaign.patientId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this campaign' });
      }

      const updatedCampaign = await campaignService.updateCampaign(id, req.body);
      return res.json(updatedCampaign);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },
];

export const deleteCampaign = [
  auth,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const campaign = await campaignService.getCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      const userId = (req as any).user?.id;
      if (!userId || campaign.patientId !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this campaign' });
      }

      await campaignService.deleteCampaign(id);
      return res.json({ message: 'Campaign deleted successfully' });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },
];
