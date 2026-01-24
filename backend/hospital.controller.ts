import { Request, Response } from 'express';
import Joi from 'joi';
import { validate } from './validate.middleware';
import * as hospitalService from './hospital.service';

const statusSchema = Joi.object({
  status: Joi.string().valid('pending', 'active', 'rejected').required(),
});

export const getHospitals = async (_req: Request, res: Response) => {
  try {
    const hospitals = await hospitalService.getHospitals();
    res.json(hospitals);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateHospitalStatus = [
  validate(statusSchema),
  async (req: Request, res: Response) => {
    try {
      const { hospitalId } = req.params;
      const hospital = await hospitalService.updateHospitalStatus(hospitalId, req.body.status);
      res.json(hospital);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
];
