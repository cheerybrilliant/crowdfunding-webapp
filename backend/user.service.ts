import prisma from './prisma.service';

export const getUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id },
  });
};
