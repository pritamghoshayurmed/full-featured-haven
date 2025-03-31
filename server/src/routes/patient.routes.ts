import express from 'express';
import * as patientController from '../controllers/patient.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// All routes are protected
router.use(protect);

// Patient routes (patient only)
router.get(
  '/profile',
  authorize(UserRole.PATIENT),
  patientController.getPatientProfile
);

router.put(
  '/profile',
  authorize(UserRole.PATIENT),
  patientController.updatePatientProfile
);

router.get(
  '/medical-records',
  authorize(UserRole.PATIENT),
  patientController.getMedicalRecords
);

// Patient appointments
router.get(
  '/:id/appointments',
  patientController.getPatientAppointments
);

// Doctor routes (doctor only)
router.get(
  '/:id',
  authorize(UserRole.DOCTOR),
  patientController.getPatientById
);

export default router; 