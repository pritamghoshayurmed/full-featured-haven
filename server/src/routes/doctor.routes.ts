import express from 'express';
import * as doctorController from '../controllers/doctor.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Public routes
router.get('/', doctorController.getDoctors);
router.get('/top', doctorController.getTopDoctors);
router.get('/:id', doctorController.getDoctor);

// Protected doctor routes
router.use(protect);
router.use(authorize(UserRole.DOCTOR));

router.get('/dashboard/stats', doctorController.getDoctorDashboard);
router.put('/availability', doctorController.updateAvailability);
router.put('/toggle-availability', doctorController.toggleAvailabilityStatus);
router.put('/profile', doctorController.updateDoctorProfile);

// Get shared AI chats
router.get(
  '/ai-chats',
  protect,
  authorize(UserRole.DOCTOR),
  doctorController.getSharedAIChats
);

export default router; 