import { Request, Response } from 'express';
import { initializePayment, verifyPayment } from '../services/paystack.service';
import * as donationService from '../services/donation.service';
import { auth } from '../middlewares/auth.middleware';
import Joi from 'joi';

const donationSchema = Joi.object({
  amount: Joi.number().min(500).required(),
  donorName: Joi.string().optional(),
  paymentMethod: Joi.string().valid('paystack', 'mtn', 'orange', 'bank').required(),
  campaignId: Joi.string().optional(),
  eventId: Joi.string().optional(),
  message: Joi.string().optional(),
});

export const createDonation = [auth, validate(donationSchema), async (req: Request, res: Response) => {
  try {
    const donation = await donationService.createDonation(req.body);
    if (req.body.paymentMethod === 'paystack') {
      const payment = await initializePayment(req.user!.email, req.body.amount, donation.id, 'http://yourdomain.com/callback');
      return res.json({ donation, paymentUrl: payment.data.authorization_url });
    }
    // For mtn/orange/bank: simulate or integrate API
    res.status(201).json(donation);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}];

export const webhook = async (req: Request, res: Response) => {
  try {
    // Verify Paystack signature
    const event = req.body;
    if (event.event === 'charge.success') {
      await donationService.updateStatus(event.data.reference, 'success');
    }
    res.status(200).send('OK');
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Add getByCampaign, etc.