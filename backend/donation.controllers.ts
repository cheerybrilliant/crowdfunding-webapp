 import { Request, Response } from 'express';
import * as donationService from './donation.service';
import { auth } from './auth.middleware';
import Joi from 'joi';
import { validate } from './validate.middleware';  // assuming this exists

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
  auth,
  validate(donationSchema),
  async (req: Request, res: Response) => {
    try {
      const donation = await donationService.createDonation(req.body);

      const paymentInfo = await donationService.initiateMTNPayment(
        donation.id,
        req.body.amount,
        req.body.donorPhone,
        req.body.donorName || 'Anonymous Donor',
     
      );

      return res.status(201).json({
        donation,
        payment: {
          status: paymentInfo.status || 'PENDING',
          requestId: paymentInfo.requestId || donation.id,
          message: 'MTN MoMo payment request sent. User will receive prompt on phone.',
          note: 'Frontend should poll /api/donations/mtn-status/:donationId',
        },
        message: 'Donation created – awaiting MTN confirmation',
      });
    } catch (err: any) {
      console.error('Donation creation error:', err);
      return res.status(400).json({ 
        message: err.message || 'Failed to create donation',
      });
    }
  },
];

export const checkDonationStatus = async (req: Request, res: Response) => {
  try {
    const { donationId } = req.params;
    const statusInfo = await donationService.checkMTNPaymentStatus(donationId);

    res.json({
      donationId,
      status: statusInfo.status,
      details: statusInfo.details || null,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Status check failed' });
  }
};

// Removed completely:
// - if (req.body.paymentMethod === 'paystack') branch
// - initializePayment function (dummy Paystack)
// - webhook function (Paystack-specific)

// You can add future MTN callback here if needed:
// export const mtnCallback = async (req: Request, res: Response) => { ... }