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
    const doctors = await Doctor.find()
      .populate('user', 'firstName lastName email profilePicture')
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching doctors'
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

// @desc    Get doctor dashboard stats
// @route   GET /api/doctors/dashboard
// @access  Private (Doctor only)
export const getDoctorDashboard = async (req: Request, res: Response) => {
  try {
    // Find doctor profile by user ID
    const doctorProfile = await Doctor.findOne({ user: req.user.id });
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get doctor stats
    const totalAppointments = await Appointment.countDocuments({ doctor: doctorProfile._id });
    const pendingAppointments = await Appointment.countDocuments({ 
      doctor: doctorProfile._id, 
      status: 'pending'
    });
    const completedAppointments = await Appointment.countDocuments({ 
      doctor: doctorProfile._id, 
      status: 'completed'
    });
    const cancelledAppointments = await Appointment.countDocuments({ 
      doctor: doctorProfile._id, 
      status: 'cancelled'
    });

    // Get total earnings
    const totalEarnings = await Earning.aggregate([
      { $match: { doctor: doctorProfile._id } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      doctor: doctorProfile._id,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'firstName lastName profilePicture'
      }
    })
    .sort({ date: 1, startTime: 1 })
    .limit(5);

    // Get monthly earnings
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const monthlyEarnings = await Earning.aggregate([
      { 
        $match: { 
          doctor: doctorProfile._id,
          date: { $gte: startOfYear }
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: '$date' }, 
            year: { $year: '$date' } 
          },
          total: { $sum: '$netAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly earnings for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const earningsChart = Array(12).fill(0);
    
    monthlyEarnings.forEach(item => {
      const monthIndex = item._id.month - 1;
      earningsChart[monthIndex] = item.total;
    });

    const formattedEarningsChart = months.map((month, index) => ({
      name: month,
      amount: earningsChart[index]
    }));
    
    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        upcomingAppointments,
        earningsChart: formattedEarningsChart
      }
    });
  } catch (error) {
    console.error('Get doctor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
};

// @desc    Get AI chat summaries shared with doctor
// @route   GET /api/doctors/ai-chats
// @access  Private (Doctor only)
export const getSharedAIChats = async (req: Request, res: Response) => {
  try {
    // Get doctor information
    const doctor = await Doctor.findOne({ user: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Find AI chats shared with this doctor
    const sharedChats = await AIChat.find({ sharedWithDoctor: req.user.id })
      .populate('user', 'firstName lastName email profilePicture')
      .sort({ updatedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: sharedChats.length,
      data: sharedChats
    });
  } catch (error) {
    console.error('Get shared AI chats error:', error);
    res.status(500).json({
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
