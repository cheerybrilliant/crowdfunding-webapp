import { Request, Response } from 'express';
import Joi from 'joi';
import { validate } from './validate.middleware';
import * as eventService from './event.service';

const eventSchema = Joi.object({
  title: Joi.string().required(),
  date: Joi.date().required(),
  location: Joi.string().required(),
  description: Joi.string().required(),
  eventType: Joi.string().optional(),
  goalAmount: Joi.number().min(0).optional(),
  raisedAmount: Joi.number().min(0).optional(),
  capacity: Joi.number().min(0).optional(),
  needsFunding: Joi.boolean().optional(),
});

export const createEvent = [
  validate(eventSchema),
  async (req: Request, res: Response) => {
    try {
      const event = await eventService.createEvent(req.body);
      res.status(201).json(event);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
];

export const getEvents = async (_req: Request, res: Response) => {
  try {
    const events = await eventService.getEvents();
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = [
  validate(eventSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const event = await eventService.updateEvent(id, req.body);
      res.json(event);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
];

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await eventService.deleteEvent(id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
