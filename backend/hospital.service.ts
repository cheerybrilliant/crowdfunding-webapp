import prisma from './prisma.service';

export const getHospitals = async () => {
  return prisma.hospital.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const updateHospitalStatus = async (hospitalId: string, status: string) => {
  return prisma.hospital.update({
    where: { hospitalId },
    data: { status },
  });
};
