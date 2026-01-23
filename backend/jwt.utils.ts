import jwt from 'jsonwebtoken';
import { config } from './config';


if(!config.JWT_SECRET){
  throw new Error('JWT_SECRET is not defined in the configuration.');
}

export const signToken = (payload: any, expiresIn: string = config.JWT_EXPIRE): string => {
  try {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn:expiresIn }as jwt.SignOptions) as string;
  } catch (error) {
    throw new Error('Error signing token');
  }
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
