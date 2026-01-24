import prisma from './prisma.service';
import * as campaignService from './campaign.service';

export const createVerificationRequest = async (data: any) => {
  return prisma.verificationRequest.create({ data });
};

export const getVerificationRequests = async () => {
  return prisma.verificationRequest.findMany({
    orderBy: { submittedDate: 'desc' },
  });
};

export const approveVerification = async (id: string) => {
  const request = await prisma.verificationRequest.update({
    where: { id },
    data: { status: 'approved' },
  });

  if (request.patientEmail) {
    await prisma.user.updateMany({
      where: { email: request.patientEmail },
      data: { verified: true },
    });
  }

  await campaignService.createCampaign({
    title: request.campaignTitle,
    description: request.description || 'Medical support campaign',
    goalAmount: request.treatmentCost,
    patientName: request.patientName,
    hospitalName: request.hospitalName,
    patientId: undefined,
  });

  return request;
};

export const rejectVerification = async (id: string) => {
  return prisma.verificationRequest.update({
    where: { id },
    data: { status: 'rejected' },
  });
};
