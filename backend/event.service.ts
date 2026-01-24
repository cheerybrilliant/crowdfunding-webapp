import prisma from './prisma.service';

export const createEvent = async (data: any) => {
  return prisma.event.create({ data });
};

export const getEvents = async () => {
  return prisma.event.findMany({ orderBy: { date: 'asc' } });
};

export const updateEvent = async (id: string, data: any) => {
  return prisma.event.update({ where: { id }, data });
};

export const deleteEvent = async (id: string) => {
  return prisma.event.delete({ where: { id } });
};
