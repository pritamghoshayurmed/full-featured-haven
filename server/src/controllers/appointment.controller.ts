import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Appointment, { AppointmentStatus, AppointmentType, PaymentStatus } from '../models/appointment.model';
import Doctor from '../models/doctor.model';
import Patient from '../models/patient.model';
import Earning, { EarningType } from '../models/earnings.model';
import mongoose from 'mongoose';
import { UserRole } from '../models/user.model';

// Helper function to check if time slot is available
const isTimeSlotAvailable = async (
  doctorId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
) => {
  const appointments = await Appointment.find({
    doctor: doctorId,
    date: new Date(date.toISOString().split('T')[0]),
    status: { $nin: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
    _id: { $ne: excludeAppointmentId }
  });

  // Check if any existing appointment overlaps with the requested time slot
  return !appointments.some(appointment => {
    const existingStart = appointment.startTime;
    const existingEnd = appointment.endTime;

    return (
      (startTime >= existingStart && startTime < existingEnd) ||
      (endTime > existingStart && endTime <= existingEnd) ||
      (startTime <= existingStart && endTime >= existingEnd)
    );
  });
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
export const createAppointment = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    doctorId, 
    date, 
    startTime, 
    endTime, 
    type, 
    reasonForVisit, 
    symptoms 
  } = req.body;

  try {
    // Find doctor and get consultation fee
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Validate appointment date (should be in the future)
    const appointmentDate = new Date(date);
    if (appointmentDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future'
      });
    }

    // Check if doctor is available at the requested time
    if (!await isTimeSlotAvailable(doctorId, appointmentDate, startTime, endTime)) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is not available'
      });
    }

    // Find patient (current user)
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      doctor: doctorId,
      patient: patient._id,
      date: appointmentDate,
      startTime,
      endTime,
      status: AppointmentStatus.PENDING,
      type: type || AppointmentType.IN_PERSON,
      reasonForVisit,
      symptoms: symptoms || [],
      fee: doctor.consultationFee,
      payment: {
        amount: doctor.consultationFee,
        status: PaymentStatus.PENDING
      },
      isFeedbackProvided: false
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating appointment'
    });
  }
};

// @desc    Get appointments by doctor or patient
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      date, 
      fromDate, 
      toDate, 
      limit = 10, 
      page = 1 
    } = req.query;

    // Base query
    const query: any = {};

    // Add filters based on user role
    if (req.user.role === UserRole.DOCTOR) {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }
      query.doctor = doctor._id;
    } else if (req.user.role === UserRole.PATIENT) {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found'
        });
      }
      query.patient = patient._id;
    }

    // Add additional filters
    if (status) {
      query.status = status;
    }

    if (date) {
      query.date = new Date(date as string);
    } else if (fromDate && toDate) {
      query.date = {
        $gte: new Date(fromDate as string),
        $lte: new Date(toDate as string)
      };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get appointments
    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName email profilePicture'
        }
      })
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email profilePicture'
        }
      })
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      data: appointments,
      pagination: {
        current: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName email profilePicture'
        }
      })
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email profilePicture'
        }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized (either the doctor or patient for this appointment)
    let isAuthorized = false;
    if (req.user.role === UserRole.DOCTOR) {
      const doctor = await Doctor.findOne({ user: req.user.id });
      isAuthorized = doctor ? appointment.doctor.toString() === doctor._id.toString() : false;
    } else if (req.user.role === UserRole.PATIENT) {
      const patient = await Patient.findOne({ user: req.user.id });
      isAuthorized = patient ? appointment.patient.toString() === patient._id.toString() : false;
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointment'
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor)
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { status, notes, diagnosis, prescription, followUpDate } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if doctor is authorized
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Update status
    appointment.status = status;
    
    // Update additional fields if provided
    if (notes) appointment.notes = notes;
    if (diagnosis) appointment.diagnosis = diagnosis;
    if (prescription) appointment.prescription = prescription;
    if (followUpDate) appointment.followUpDate = new Date(followUpDate);

    // Create earnings entry if appointment is completed
    if (status === AppointmentStatus.COMPLETED && appointment.payment.status === PaymentStatus.PAID) {
      // Create an earnings record
      await Earning.create({
        doctor: doctor._id,
        appointment: appointment._id,
        amount: appointment.fee,
        type: EarningType.APPOINTMENT,
        description: `Appointment fees from patient ${appointment.patient}`,
        date: new Date(),
        platformFee: appointment.fee * 0.1, // Assuming 10% platform fee
        netAmount: appointment.fee * 0.9,
        isPaid: false,
        payoutStatus: 'pending'
      });
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
      message: `Appointment ${status}`
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating appointment status'
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const { cancellationReason } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment can be cancelled (not already completed or cancelled)
    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel appointment that is already ${appointment.status}`
      });
    }

    // Check if user is authorized (either the patient or the doctor)
    let isAuthorized = false;
    if (req.user.role === UserRole.DOCTOR) {
      const doctor = await Doctor.findOne({ user: req.user.id });
      isAuthorized = doctor ? appointment.doctor.toString() === doctor._id.toString() : false;
    } else if (req.user.role === UserRole.PATIENT) {
      const patient = await Patient.findOne({ user: req.user.id });
      isAuthorized = patient ? appointment.patient.toString() === patient._id.toString() : false;
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    // Update appointment
    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledBy = req.user.id;

    // If appointment was paid, initiate refund process (simplified)
    if (appointment.payment.status === PaymentStatus.PAID) {
      appointment.payment.status = PaymentStatus.REFUNDED;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling appointment'
    });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
export const rescheduleAppointment = async (req: Request, res: Response) => {
  try {
    const { date, startTime, endTime } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment can be rescheduled (not already completed, cancelled or no-show)
    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.NO_SHOW
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule appointment that is already ${appointment.status}`
      });
    }

    // Check if user is authorized (either the patient or the doctor)
    let isAuthorized = false;
    if (req.user.role === UserRole.DOCTOR) {
      const doctor = await Doctor.findOne({ user: req.user.id });
      isAuthorized = doctor ? appointment.doctor.toString() === doctor._id.toString() : false;
    } else if (req.user.role === UserRole.PATIENT) {
      const patient = await Patient.findOne({ user: req.user.id });
      isAuthorized = patient ? appointment.patient.toString() === patient._id.toString() : false;
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this appointment'
      });
    }

    // Validate new appointment date (should be in the future)
    const newDate = new Date(date);
    if (newDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'New appointment date must be in the future'
      });
    }

    // Check if doctor is available at the new time
    if (!await isTimeSlotAvailable(appointment.doctor.toString(), newDate, startTime, endTime, appointment._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is not available'
      });
    }

    // Update appointment
    appointment.date = newDate;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.status = AppointmentStatus.RESCHEDULED;

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment rescheduled successfully'
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rescheduling appointment'
    });
  }
};

 