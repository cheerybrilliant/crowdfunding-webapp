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
      donorPhone: data.donorPhone,
      paymentMethod: data.paymentMethod,
      message: data.message,
      campaignId: data.campaignId,
      eventId: data.eventId,
      status: 'pending',
    },
  });

  return donation;
};

export const updateDonationStatus = async (donationId: string, status: string, reference?: string) => {
  const donation = await prisma.donation.update({
    where: { id: donationId },
    data: {
      status,
      reference: reference || undefined,
    },
  });

  // Update campaign raisedAmount if donation is successful
  if (status === 'success' && donation.campaignId) {
    await prisma.campaign.update({
      where: { id: donation.campaignId },
      data: {
        raisedAmount: {
          increment: donation.amount,
        },
      },
    });
  }

  return donation;
};

export const getDonationById = async (id: string) => {
  return await prisma.donation.findUnique({
    where: { id },
    include: {
      campaign: true,
      event: true,
    },
  });
};

export const getDonationsByCampaign = async (campaignId: string) => {
  return await prisma.donation.findMany({
    where: {
      campaignId,
      status: 'success',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const initiateMTNPayment = async (
  donationId: string,
  amount: number,
  phoneNumber: string,
  donorName: string
) => {
  try {
    const paymentRequest = mtnPaymentService.preparePaymentRequest(
      amount,
      phoneNumber,
      donationId,
      `Donation from ${donorName}`,
      'Cancer Care Donation'
    );

    const response = await mtnPaymentService.initiatePayment(paymentRequest);

    // Update donation with request ID
    await prisma.donation.update({
      where: { id: donationId },
      data: {
        requestId: response.requestId,
        reference: response.requestId,
      },
    });

    return response;
  } catch (error) {
    // Update donation status to failed
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

  // Update donation status based on MTN response
  if (statusResponse.status === 'SUCCESS') {
    await updateDonationStatus(donationId, 'success', donation.requestId);
  } else if (statusResponse.status === 'FAILED') {
    await updateDonationStatus(donationId, 'failed');
  }

  return statusResponse;
};
