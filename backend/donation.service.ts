 import prisma from './prisma.service';
import { mtnPaymentService } from './mtn.service';
import { v4 as uuidv4 } from 'uuid';

export const createDonation = async (data: any) => {
  const donationId = uuidv4();

  const donation = await prisma.donation.create({
    data: {
      id: donationId,
      amount: data.amount,
      donorName: data.donorName || 'Anonymous',
      donorPhone: data.donorPhone.replace(/^\+/, ''), // normalize
      paymentMethod: data.paymentMethod,
      message: data.message,
      campaignId: data.campaignId,
      eventId: data.eventId,
      status: 'pending',
    },
  });

  return donation;
};

export const updateDonationStatus = async (
  donationId: string,
  status: string,
  reference?: string
) => {
  const donation = await prisma.donation.update({
    where: { id: donationId },
    data: {
      status,
      reference: reference || undefined,
    },
  });

  if (status === 'success' && donation.campaignId) {
    await prisma.campaign.update({
      where: { id: donation.campaignId },
      data: { raisedAmount: { increment: donation.amount } },
    });
  }

  return donation;
};

export const getDonationById = async (id: string) => {
  return await prisma.donation.findUnique({
    where: { id },
    include: { campaign: true, event: true },
  });
};

export const getDonationsByCampaign = async (campaignId: string) => {
  return await prisma.donation.findMany({
    where: { campaignId, status: 'success' },
    orderBy: { createdAt: 'desc' },
  });
};

export const initiateMTNPayment = async (
  donationId: string,
  amount: number,
  phoneNumber: string,
  donorName: string,
  payerMessage?: string
) => {
  try {
    const normalizedPhone = phoneNumber.startsWith('237')
      ? phoneNumber
      : `237${phoneNumber.replace(/^0|^237|\+/g, '')}`;

    const paymentRequest = mtnPaymentService.preparePaymentRequest(
      amount,
      normalizedPhone,
      donationId,
      payerMessage || `Donation from ${donorName || 'Anonymous'}`,
      'Cancer Care Donation'
    );

    const response = await mtnPaymentService.initiatePayment(paymentRequest);

    await prisma.donation.update({
      where: { id: donationId },
      data: {
        requestId: response.requestId,
        reference: response.requestId,
      },
    });

    return response;
  } catch (error) {
    await updateDonationStatus(donationId, 'failed');
    throw error;
  }
};

export const checkMTNPaymentStatus = async (donationId: string) => {
  const donation = await getDonationById(donationId);
  if (!donation || !donation.requestId) {
    throw new Error('Donation or request ID not found');
  }

  const statusResponse = await mtnPaymentService.checkPaymentStatus(donation.requestId);

  let newStatus = 'pending';
  const mtnStatus = statusResponse.status?.toUpperCase();

  if (['SUCCESSFUL', 'SUCCESS'].includes(mtnStatus)) {
    newStatus = 'success';
    await updateDonationStatus(donationId, 'success', donation.requestId);
  } else if (['FAILED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(mtnStatus)) {
    newStatus = 'failed';
    await updateDonationStatus(donationId, 'failed');
  }

  return {
    status: newStatus,
    mtnStatus: statusResponse.status,
    details: statusResponse,
  };
};