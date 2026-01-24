import { Router } from 'express';
import * as verificationController from './verification.controller';

const router = Router();

router.get('/', verificationController.getVerificationRequests);
router.post('/', verificationController.createVerificationRequest);
router.post('/:id/approve', verificationController.approveVerification);
router.post('/:id/reject', verificationController.rejectVerification);

export default router;
