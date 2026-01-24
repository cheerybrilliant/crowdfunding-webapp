import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from './config';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
    return;
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const hospitalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    if (!decoded.hospitalId) return res.status(403).json({ message: 'Not authorized as hospital' });
    (req as any).hospital = decoded;
    next();
    return;
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user || (req as any).user.email !== 'admin@cancercare.com') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
  return;
};
