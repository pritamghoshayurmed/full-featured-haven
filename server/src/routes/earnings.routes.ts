import express from 'express';
import * as earningsController from '../controllers/earnings.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// All routes are protected and accessible only to doctors
router.use(protect);
router.use(authorize(UserRole.DOCTOR));

// Get all earnings for the doctor
router.get('/', earningsController.getDoctorEarnings);

// Get earnings statistics
router.get('/stats', earningsController.getEarningsStats);

// Get specific earning
router.get('/:id', earningsController.getEarningById);

export default router; 