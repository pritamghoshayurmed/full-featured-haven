import express from 'express';
import { check } from 'express-validator';
import * as appointmentController from '../controllers/appointment.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// All routes are protected
router.use(protect);

// Create appointment (Patient only)
router.post(
  '/',
  authorize(UserRole.PATIENT),
  [
    check('doctorId', 'Doctor ID is required').notEmpty(),
    check('date', 'Date is required').notEmpty(),
    check('startTime', 'Start time is required').notEmpty(),
    check('endTime', 'End time is required').notEmpty(),
    check('reasonForVisit', 'Reason for visit is required').notEmpty()
  ],
  appointmentController.createAppointment
);

// Get all appointments (filtered based on user role)
router.get('/', appointmentController.getAppointments);

// Get appointment by ID
router.get('/:id', appointmentController.getAppointment);

// Update appointment status (Doctor only)
router.put(
  '/:id/status',
  authorize(UserRole.DOCTOR),
  appointmentController.updateAppointmentStatus
);

// Cancel appointment
router.put(
  '/:id/cancel',
  appointmentController.cancelAppointment
);

// Reschedule appointment
router.put(
  '/:id/reschedule',
  [
    check('date', 'Date is required').notEmpty(),
    check('startTime', 'Start time is required').notEmpty(),
    check('endTime', 'End time is required').notEmpty()
  ],
  appointmentController.rescheduleAppointment
);

// Update payment status
router.put(
  '/:id/payment',
  [
    check('status', 'Payment status is required').notEmpty()
  ],
  appointmentController.updatePaymentStatus
);

export default router; 