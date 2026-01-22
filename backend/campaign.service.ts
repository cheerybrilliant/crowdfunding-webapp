import prisma from './prisma.service';

export const createCampaign = async (data: any) => {
  return prisma.campaign.create({
    data,
    include: {
      donations: true,
    },
  });
};

export const getCampaigns = async () => {
  return prisma.campaign.findMany({
    include: {
      donations: {
        where: { status: 'success' },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getCampaignById = async (id: string) => {
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      donations: {
        where: { status: 'success' },
      },
    },
  });
};

export const updateCampaign = async (id: string, data: any) => {
  return prisma.campaign.update({
    where: { id },
    data,
    include: {
      donations: true,
    },
  });
};

export const deleteCampaign = async (id: string) => {
  return prisma.campaign.delete({
    where: { id },
  });
};

export const updateRaisedAmount = async (campaignId: string, amount: number) => {
  return prisma.campaign.update({
    where: { id: campaignId },
    data: {
      raisedAmount: {
        increment: amount,
      },
    },
  });
};