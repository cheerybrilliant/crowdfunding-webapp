import { Request, Response } from 'express';
import Joi from 'joi';
import { validate } from './validate.middleware';
import * as verificationService from './verification.service';

const requestSchema = Joi.object({
  patientName: Joi.string().required(),
  patientEmail: Joi.string().email().required(),
  campaignTitle: Joi.string().required(),
  hospitalName: Joi.string().required(),
  treatmentCost: Joi.number().min(0).required(),
  description: Joi.string().allow('').optional(),
  patientAge: Joi.number().min(0).optional(),
});

export const createVerificationRequest = [
  validate(requestSchema),
  async (req: Request, res: Response) => {
    try {
      const request = await verificationService.createVerificationRequest(req.body);
      res.status(201).json(request);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
];

export const getVerificationRequests = async (_req: Request, res: Response) => {
  try {
    const requests = await verificationService.getVerificationRequests();
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const approveVerification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await verificationService.approveVerification(id);
    res.json(request);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const rejectVerification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await verificationService.rejectVerification(id);
    res.json(request);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
