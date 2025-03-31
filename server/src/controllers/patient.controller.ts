import { Request, Response } from 'express';
import Patient from '../models/patient.model';
import User, { UserRole } from '../models/user.model';
import Doctor from '../models/doctor.model';
import Appointment, { AppointmentStatus } from '../models/appointment.model';
import mongoose from 'mongoose';

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private (Patient only)
export const getPatientProfile = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate('user', '-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patient profile'
    });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private (Patient only)
export const updatePatientProfile = async (req: Request, res: Response) => {
  try {
    const {
      dateOfBirth,
      gender,
      bloodType,
      height,
      weight,
      allergies,
      chronicConditions,
      medications,
      emergencyContact,
      address,
      insuranceInfo
    } = req.body;

    // Find patient profile
    const patientProfile = await Patient.findOne({ user: req.user.id });
    
    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }
    
    // Update fields
    if (dateOfBirth) patientProfile.dateOfBirth = dateOfBirth;
    if (gender) patientProfile.gender = gender;
    if (bloodType) patientProfile.bloodType = bloodType;
    if (height) patientProfile.height = height;
    if (weight) patientProfile.weight = weight;
    if (allergies) patientProfile.allergies = allergies;
    if (chronicConditions) patientProfile.chronicConditions = chronicConditions;
    if (medications) patientProfile.medications = medications;
    if (emergencyContact) patientProfile.emergencyContact = emergencyContact;
    if (address) patientProfile.address = address;
    if (insuranceInfo) patientProfile.insuranceInfo = insuranceInfo;
    
    await patientProfile.save();
    
    res.status(200).json({
      success: true,
      data: patientProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Get patient medical records
// @route   GET /api/patients/medical-records
// @access  Private (Patient only)
export const getMedicalRecords = async (req: Request, res: Response) => {
  try {
    // Find patient
    const patient = await Patient.findOne({ user: req.user.id });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }
    
    // Get completed appointments with diagnosis and prescriptions
    const appointments = await Appointment.find({
      patient: patient._id,
      status: AppointmentStatus.COMPLETED,
      $or: [
        { diagnosis: { $exists: true, $ne: null } },
        { prescription: { $exists: true, $ne: [] } }
      ]
    })
    .populate({
      path: 'doctor',
      populate: {
        path: 'user',
        select: 'firstName lastName'
      }
    })
    .sort({ date: -1 });
    
    // Format medical records from appointments
    const medicalRecords = appointments.map(appointment => {
      // Safely cast doctor to access nested properties
      const doctor = appointment.doctor as any;
      
      return {
        id: appointment._id,
        date: appointment.date,
        doctorName: doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : 'Doctor',
        doctorSpecialization: doctor.specialization || 'General',
        diagnosis: appointment.diagnosis,
        prescription: appointment.prescription,
        notes: appointment.notes,
        followUpDate: appointment.followUpDate
      };
    });
    
    // Include basic patient health info
    const healthInfo = {
      bloodType: patient.bloodType,
      height: patient.height,
      weight: patient.weight,
      allergies: patient.allergies,
      chronicConditions: patient.chronicConditions,
      medications: patient.medications
    };
    
    // Get doctor information from populated appointment
    const appointmentsWithDoctorInfo = appointments.map(appointment => {
      // Ensure doctor is populated before accessing its properties
      const doctor = appointment.doctor as any;
      
      return {
        _id: appointment._id,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        type: appointment.type,
        doctorName: doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : 'Doctor',
        doctorSpecialization: doctor.specialization || 'General',
        reasonForVisit: appointment.reasonForVisit,
        fee: appointment.fee
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        healthInfo,
        medicalRecords,
        appointmentsWithDoctorInfo
      }
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching medical records'
    });
  }
};

// @desc    Get patient by ID (for doctors)
// @route   GET /api/patients/:id
// @access  Private (Doctor only)
export const getPatientById = async (req: Request, res: Response) => {
  try {
    // Check if doctor is requesting
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access patient information'
      });
    }
    
    // Find patient
    const patient = await Patient.findById(req.params.id)
      .populate('user', 'firstName lastName email profilePicture');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Check if doctor has had appointments with this patient
    const hasAppointments = await Appointment.exists({
      doctor: doctor._id,
      patient: patient._id,
      status: { $in: [AppointmentStatus.COMPLETED, AppointmentStatus.CONFIRMED] }
    });
    
    if (!hasAppointments) {
      // Return limited information
      return res.status(200).json({
        success: true,
        data: {
          id: patient._id,
          user: patient.user,
          // Only provide basic information due to privacy
          gender: patient.gender,
          age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
        },
        message: 'Limited patient information (no appointment history)'
      });
    }
    
    // Get patient's completed appointments with this doctor
    const appointments = await Appointment.find({
      doctor: doctor._id,
      patient: patient._id,
      status: AppointmentStatus.COMPLETED
    }).sort({ date: -1 });
    
    // Return full patient information for doctors who have treated them
    res.status(200).json({
      success: true,
      data: {
        patient,
        appointments
      }
    });
  } catch (error) {
    console.error('Get patient by ID error:', error);
    
    // Check if error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error fetching patient'
    });
  }
};

// @desc    Get patient appointments
// @route   GET /api/patients/:id/appointments
// @access  Private
export const getPatientAppointments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find patient by user ID or patient ID
    let patientId = id;
    
    // If ID is not a valid MongoDB ObjectId, it might be a user ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const patient = await Patient.findOne({ user: id });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }
      patientId = patient._id.toString();
    }
    
    // Get appointments
    const appointments = await Appointment.find({ patient: patientId })
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName email profilePicture'
        }
      })
      .sort({ date: -1, startTime: -1 });
    
    // Format appointments for frontend
    const formattedAppointments = appointments.map(appointment => {
      // Cast doctor to access nested properties
      const doctor = appointment.doctor as any;
      
      return {
        id: appointment._id,
        doctorId: doctor._id,
        doctorName: doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : 'Doctor',
        doctorSpecialization: doctor.specialization || 'General',
        doctorProfilePicture: doctor.user?.profilePicture || '',
        date: appointment.date,
        time: `${appointment.startTime} - ${appointment.endTime}`,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        type: appointment.type,
        reasonForVisit: appointment.reasonForVisit,
        fee: appointment.fee || doctor.consultationFee
      };
    });
    
    res.status(200).json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
}; 