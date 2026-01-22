import prisma from './prisma.service';

export const createCampaign = async (data: any) => {
  return prisma.campaign.create({ data });
};

export const getCampaigns = async () => {
  return prisma.campaign.findMany();
};

export const getCampaignById = async (id: string) => {
  return prisma.campaign.findUnique({ where: { id } });
};

// Update raisedAmount after donation, etc.