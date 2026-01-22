import jwt from 'jsonwebtoken';
import { config } from './config';

export const signToken = (payload: any, expiresIn: string = config.JWT_EXPIRE): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};
