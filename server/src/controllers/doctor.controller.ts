import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Doctor from '../models/doctor.model';
import User, { UserRole } from '../models/user.model';
import Appointment from '../models/appointment.model';
import Earning from '../models/earnings.model';
import mongoose from 'mongoose';
import { AIChat } from '../models/chat.model';

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find({ isAvailableForConsultation: true })
      .populate({
        path: 'user',
        select: 'firstName lastName email profilePicture'
      });
    
    // Format data for frontend
    const formattedDoctors = doctors.map(doctor => {
      const userObj = doctor.user as any;
      
      // Generate a user-friendly availability string
      let availabilityStr = "Available";
      if (doctor.availability && doctor.availability.length > 0) {
        // Just pick the first day for simplicity
        const firstDay = doctor.availability[0];
        availabilityStr = `${firstDay.day} ${firstDay.startTime}-${firstDay.endTime}`;
      }
      
      return {
        id: doctor._id,
        name: userObj.firstName && userObj.lastName 
          ? `Dr. ${userObj.firstName} ${userObj.lastName}` 
          : 'Doctor',
        email: userObj.email || '',
        specialization: doctor.specialization,
        experience: doctor.experience,
        location: `${doctor.address.city}, ${doctor.address.state}`,
        fee: doctor.consultationFee,
        rating: doctor.rating,
        reviews: doctor.reviewCount || 0,
        availability: availabilityStr,
        profilePicture: userObj.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userObj.firstName || '')}+${encodeURIComponent(userObj.lastName || '')}&background=random`
      };
    });
    
    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors
    });
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'firstName lastName email profilePicture');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Get doctor error:', error);

    // Check if error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching doctor'
    });
  }
};

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability
// @access  Private (Doctor only)
export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const { availability } = req.body;
    
    // Find doctor profile by user ID
    const doctorProfile = await Doctor.findOne({ user: req.user.id });
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Update availability
    doctorProfile.availability = availability;
    await doctorProfile.save();
    
    res.status(200).json({
      success: true,
      data: doctorProfile.availability,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating availability'
    });
  }
};

// @desc    Toggle doctor availability status
// @route   PUT /api/doctors/toggle-availability
// @access  Private (Doctor only)
export const toggleAvailabilityStatus = async (req: Request, res: Response) => {
  try {
    // Find doctor profile by user ID
    const doctorProfile = await Doctor.findOne({ user: req.user.id });
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Toggle availability status
    doctorProfile.isAvailableForConsultation = !doctorProfile.isAvailableForConsultation;
    await doctorProfile.save();
    
    res.status(200).json({
      success: true,
      isAvailable: doctorProfile.isAvailableForConsultation,
      message: `You are now ${doctorProfile.isAvailableForConsultation ? 'available' : 'unavailable'} for consultations`
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling availability'
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
export const updateDoctorProfile = async (req: Request, res: Response) => {
  try {
    const {
      specialization,
      qualifications,
      experience,
      hospitalAffiliations,
      consultationFee,
      bio,
      address
    } = req.body;
    
    // Find doctor profile by user ID
    const doctorProfile = await Doctor.findOne({ user: req.user.id });
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Update fields
    if (specialization) doctorProfile.specialization = specialization;
    if (qualifications) doctorProfile.qualifications = qualifications;
    if (experience) doctorProfile.experience = experience;
    if (hospitalAffiliations) doctorProfile.hospitalAffiliations = hospitalAffiliations;
    if (consultationFee) doctorProfile.consultationFee = consultationFee;
    if (bio) doctorProfile.bio = bio;
    if (address) doctorProfile.address = address;
    
    await doctorProfile.save();
    
    res.status(200).json({
      success: true,
      data: doctorProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Get doctor dashboard statistics
// @route   GET /api/doctors/dashboard/stats
// @access  Private (Doctor only)
export const getDoctorDashboard = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEndDate = new Date(today);
    todayEndDate.setDate(today.getDate() + 1);
    
    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - today.getDay());
    
    const monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1);

    // In a real implementation, we would fetch from database
    // Get total appointments
    const totalAppointments = 25;
    
    // Get today's appointments
    const todayAppointments = 3;
    
    // Get appointments for the week
    const weekAppointments = 12;
    
    // Get appointments for the month
    const monthAppointments = 20;
    
    // Calculate earnings
    const totalEarnings = totalAppointments * doctor.consultationFee;
    const weekEarnings = weekAppointments * doctor.consultationFee;
    const monthEarnings = monthAppointments * doctor.consultationFee;
    
    // Get total patients count
    const totalPatients = 15;
    
    // Return dashboard data
    return res.status(200).json({
      success: true,
      data: {
        appointments: {
          total: totalAppointments,
          today: todayAppointments,
          week: weekAppointments,
          month: monthAppointments
        },
        earnings: {
          total: totalEarnings,
          week: weekEarnings,
          month: monthEarnings
        },
        patients: {
          total: totalPatients
        },
        doctor: {
          rating: doctor.rating,
          reviewCount: doctor.reviewCount,
          isAvailable: doctor.isAvailableForConsultation
        }
      }
    });
  } catch (error) {
    console.error('Error fetching doctor dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
};

// @desc    Get AI chats shared with doctor
// @route   GET /api/doctors/ai-chats
// @access  Private (Doctor only)
export const getSharedAIChats = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user.id;
    
    // In a real implementation, we would query the SharedAIChat collection
    // For now, we'll return mock data
    const mockSharedChats = [
      {
        id: '1',
        title: 'Persistent Headache Consultation',
        patientName: 'John Smith',
        sharedOn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        summary: 'Patient reports persistent headaches for 5 days, mainly in the frontal region, rated 7/10 on pain scale. Pain worsens in the evening and with screen exposure. No nausea or vomiting. Patient has been taking OTC painkillers with minimal relief.'
      },
      {
        id: '2',
        title: 'Joint Pain Assessment',
        patientName: 'Mary Johnson',
        sharedOn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        summary: 'Patient reports joint pain in knees and fingers for 3 weeks. Pain is worse in the morning and improves with activity. No recent injury. Family history of rheumatoid arthritis. Patient has been taking ibuprofen with moderate relief.'
      }
    ];
    
    return res.status(200).json({
      success: true,
      data: mockSharedChats
    });
  } catch (error) {
    console.error('Error fetching shared AI chats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching shared AI chats'
    });
  }
};

// Get top doctors sorted by rating
export const getTopDoctors = async (req: Request, res: Response) => {
  try {
    const topDoctors = await Doctor.find({ isAvailableForConsultation: true })
      .sort({ rating: -1 })
      .limit(5)
      .populate({
        path: 'user',
        select: 'name email profilePicture'
      });
    
    // Transform data to match frontend expectations
    const formattedDoctors = topDoctors.map(doctor => {
      const userObj = doctor.user as any; // Cast to any to resolve TypeScript issues
      return {
        id: doctor._id,
        name: userObj.name || 'Doctor',
        email: userObj.email || '',
        specialization: doctor.specialization,
        experience: doctor.experience,
        rating: doctor.rating,
        reviews: doctor.reviewCount || 0,
        avatar: userObj.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userObj.name || 'Doctor')}&background=random`,
        fee: doctor.consultationFee
      };
    });
    
    return res.status(200).json({
      success: true,
      message: "Top doctors retrieved successfully",
      data: formattedDoctors
    });
  } catch (error: any) {
    console.error("Error fetching top doctors:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top doctors",
      error: error.message
    });
  }
};

// @desc    Get doctor's availability
// @route   GET /api/doctors/:id/availability
// @access  Public
export const getDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // For a specific date, we could check appointment slots
    // For this implementation, we'll just return the general availability
    const availabilitySlots = doctor.availability.map(slot => ({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime
    }));

    return res.status(200).json({
      success: true,
      data: availabilitySlots
    });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching doctor availability'
    });
  }
};

// @desc    Get doctor's reviews
// @route   GET /api/doctors/:id/reviews
// @access  Public
export const getDoctorReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // This would normally fetch reviews from a separate collection
    // For now, we'll return mock data
    const mockReviews = [
      {
        id: '1',
        rating: 5,
        comment: 'Excellent doctor! Very thorough and professional.',
        patientName: 'John D.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      },
      {
        id: '2',
        rating: 4,
        comment: 'Good experience overall. Would recommend.',
        patientName: 'Sara M.',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // 12 days ago
      },
      {
        id: '3',
        rating: 5,
        comment: 'Very knowledgeable and patient. Took time to explain everything.',
        patientName: 'Ravi K.',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      }
    ];

    return res.status(200).json({
      success: true,
      data: mockReviews
    });
  } catch (error) {
    console.error('Error fetching doctor reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching doctor reviews'
    });
  }
}; 
