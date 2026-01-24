import { Router } from 'express';
import * as authController from './auth.controller';

const router = Router();

router.post('/register', authController.registerUserController);
router.post('/login', authController.loginUserController);
router.post('/hospital/register', authController.registerHospitalController);
router.post('/hospital/login', authController.loginHospitalController);

export default router;
