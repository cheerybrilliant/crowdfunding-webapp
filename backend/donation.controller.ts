import { Request, Response } from 'express';
import * as donationService from './donation.service';
import { auth } from './auth.middleware';
import { validate } from './validate.middleware';
import Joi from 'joi';

const donationSchema = Joi.object({
  amount: Joi.number().min(500).required(),
  donorName: Joi.string().optional(),
  donorPhone: Joi.string().required(),
  paymentMethod: Joi.string().valid('mtn', 'orange', 'paystack', 'bank').required(),
  campaignId: Joi.string().optional(),
  eventId: Joi.string().optional(),
  message: Joi.string().optional(),
});

export const createDonation = [
  validate(donationSchema),
  async (req: Request, res: Response) => {
    try {
      const donation = await donationService.createDonation(req.body);

      if (req.body.paymentMethod === 'mtn') {
        const paymentResponse = await donationService.initiateMTNPayment(
          donation.id,
          req.body.amount,
          req.body.donorPhone,
          req.body.donorName || 'Anonymous'
        );

        return res.status(201).json({
          donation,
          paymentResponse,
          message: 'MTN payment initiated. Awaiting customer confirmation.',
        });
      }

      res.status(201).json({
        donation,
        message: 'Donation created. Please complete payment.',
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
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
    res.status(400).json({ message: err.message });
  }
};

export const getDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donation = await donationService.getDonationById(id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json(donation);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
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

export const webhook = async (req: Request, res: Response) => {
  try {
    // Handle Paystack webhook
    const event = req.body;

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      // Find donation by reference and update status
      // This would require a database lookup by reference
      console.log('Paystack webhook received:', reference);
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
