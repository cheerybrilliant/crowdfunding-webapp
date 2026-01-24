import { Request, Response } from 'express';
import * as userService from './user.service';

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
