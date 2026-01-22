import { Request, Response } from 'express';
import * as campaignService from '../services/campaign.service';
import { auth } from '../middlewares/auth.middleware';
import Joi from 'joi';

const campaignSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  goalAmount: Joi.number().required(),
  patientName: Joi.string().required(),
  patientAge: Joi.number(),
  hospitalName: Joi.string().required(),
});

export const createCampaign = [auth, validate(campaignSchema), async (req: Request, res: Response) => {
  try {
    const campaign = await campaignService.createCampaign({ ...req.body, patientId: req.user!.id });
    res.status(201).json(campaign);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}];

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await campaignService.getCampaigns();
    res.json(campaigns);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Add getById, updatePhoto (with multer), delete