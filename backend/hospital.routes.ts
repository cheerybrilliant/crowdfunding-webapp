import { Router } from 'express';
import * as hospitalController from './hospital.controller';

const router = Router();

router.get('/', hospitalController.getHospitals);
router.patch('/:hospitalId/status', hospitalController.updateHospitalStatus);

export default router;
