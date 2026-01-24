import prisma from './prisma.service';
import bcrypt from 'bcryptjs';
import { signToken } from './jwt.utils';

export const registerUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  data.passwordHash = await bcrypt.hash(data.password, 12);
  delete data.password;
  
  const user = await prisma.user.create({ data });
  const token = signToken({ id: user.id, email: user.email, accountType: user.accountType });
  
  return { user: { ...user, passwordHash: undefined }, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error('Invalid credentials');
  }
  
  const token = signToken({ id: user.id, email: user.email, accountType: user.accountType });
  return { user: { ...user, passwordHash: undefined }, token };
};

// Hospital register/login
export const registerHospital = async (data: any) => {
  if (data.verificationCode !== process.env.HOSPITAL_VERIFICATION_CODE) {
    throw new Error('Invalid verification code');
  }

  const existingHospital = await prisma.hospital.findUnique({ where: { adminEmail: data.adminEmail } });
  if (existingHospital) {
    throw new Error('Hospital with this email already registered');
  }

  data.passwordHash = await bcrypt.hash(data.password, 12);
  delete data.password;
  delete data.verificationCode;

  const hospital = await prisma.hospital.create({ data });
  const token = signToken({ id: hospital.id, hospitalId: hospital.hospitalId, adminEmail: hospital.adminEmail });
  
  return { hospital: { ...hospital, passwordHash: undefined }, token };
};

export const loginHospital = async (adminEmail: string, password: string) => {
  const hospital = await prisma.hospital.findUnique({ where: { adminEmail } });
  if (!hospital || !(await bcrypt.compare(password, hospital.passwordHash))) {
    throw new Error('Invalid credentials');
  }
  
  if (hospital.status !== 'active') {
    throw new Error('Hospital account not active');
  }

  const token = signToken({ id: hospital.id, hospitalId: hospital.hospitalId, adminEmail: hospital.adminEmail });
  return { hospital: { ...hospital, passwordHash: undefined }, token };
};
