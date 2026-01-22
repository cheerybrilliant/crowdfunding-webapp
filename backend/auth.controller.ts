import { Request, Response } from 'express';
import { registerUser, loginUser, registerHospital, loginHospital } from '../services/auth.service';
import { validate } from '../middlewares/validate.middleware';
import Joi from 'joi';

const userSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(8).required(),
  accountType: Joi.string().valid('donor', 'patient').required(),
});

const hospitalSchema = Joi.object({
  hospitalId: Joi.string().required(),
  hospitalName: Joi.string().required(),
  address: Joi.string().required(),
  phone: Joi.string().required(),
  adminName: Joi.string().required(),
  adminEmail: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  verificationCode: Joi.string().required(),
});

export const registerUserController = [validate(userSchema), async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}];

export const loginUserController = async (req: Request, res: Response) => {
  try {
    const { user, token } = await loginUser(req.body.email, req.body.password);
    res.json({ user, token });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

// Similar for hospital
export const registerHospitalController = [validate(hospitalSchema), async (req: Request, res: Response) => {
  try {
    const hospital = await registerHospital(req.body);
    res.status(201).json(hospital);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}];

export const loginHospitalController = async (req: Request, res: Response) => {
  try {
    const { hospital, token } = await loginHospital(req.body.adminEmail, req.body.password);
    res.json({ hospital, token });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};