 import { Request, Response } from 'express';
import * as donationService from './donation.service';
import { validate } from './validate.middleware';
import Joi from 'joi';

const donationSchema = Joi.object({
  amount: Joi.number().min(500).required(),
  donorName: Joi.string().optional(),
  donorPhone: Joi.string().required(),
  paymentMethod: Joi.string().valid('mtn').required(),  // only mtn
  campaignId: Joi.string().optional(),
  eventId: Joi.string().optional(),
  message: Joi.string().optional(),
});

export const createDonation = [
  validate(donationSchema),
  async (req: Request, res: Response) => {
    try {
      const donation = await donationService.createDonation(req.body);

      const paymentResponse = await donationService.initiateMTNPayment(
        donation.id,
        req.body.amount,
        req.body.donorPhone,
        req.body.donorName || 'Anonymous'
      );

      return res.status(201).json({
        donation,
        payment: {
          status: 'PENDING',
          requestId: paymentResponse.requestId || donation.id,
          message: 'MTN payment request sent. Awaiting customer confirmation on phone.',
          pollUrl: `/api/donations/mtn-status/${donation.id}`,
        },
        message: 'Donation created. Please complete payment on your phone.',
      });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || 'Failed to initiate donation' });
    }
  },
];

export const checkMTNPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { donationId } = req.params;
    const status = await donationService.checkMTNPaymentStatus(donationId);

    res.json({
      donationId,
      status,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Status check failed' });
  }
};

export const getDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donation = await donationService.getDonationById(id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    return res.json(donation);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const getCampaignDonations = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const donations = await donationService.getDonationsByCampaign(campaignId);

    res.json(donations);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Removed completely: webhook (was Paystack-specific)