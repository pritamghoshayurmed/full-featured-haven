import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User, { UserRole } from '../models/user.model';
import Doctor from '../models/doctor.model';
import Patient from '../models/patient.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    phoneNumber, 
    role,
    // Doctor specific fields
    specialization,
    qualifications,
    experience,
    licenseNumber,
    hospitalAffiliations,
    consultationFee,
    bio,
    address,
    availability,
    // Patient specific fields
    dateOfBirth,
    gender,
    bloodType,
    height,
    weight,
    allergies,
    chronicConditions
  } = req.body;

  try {
    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role: role || UserRole.PATIENT,
      isVerified: false
    });

    // Save user
    await user.save();

    // If doctor role, create doctor profile
    if (user.role === UserRole.DOCTOR) {
      // Validate doctor required fields
      if (!specialization || !qualifications || !experience || !licenseNumber || !consultationFee || !bio || !address || !availability) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Please provide all required doctor information'
        });
      }

      const doctor = new Doctor({
        user: user._id,
        specialization,
        qualifications: Array.isArray(qualifications) ? qualifications : [qualifications],
        experience,
        licenseNumber,
        hospitalAffiliations: hospitalAffiliations || [],
        consultationFee,
        bio,
        address,
        availability: Array.isArray(availability) ? availability : [availability]
      });

      await doctor.save();
    }

    // If patient role, create patient profile
    if (user.role === UserRole.PATIENT) {
      // Validate patient required fields
      if (!dateOfBirth || !gender || !address) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Please provide all required patient information'
        });
      }

      const patient = new Patient({
        user: user._id,
        dateOfBirth,
        gender,
        bloodType,
        height,
        weight,
        allergies: allergies || [],
        chronicConditions: chronicConditions || [],
        address
      });

      await patient.save();
    }

    // Create and send token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });

  try {
    // FOR TESTING: Accept any credentials
    // Create a mock token and user response
    const mockToken = 'test-jwt-token-for-development-only';

    // Find user by email if they exist, or create a mock user
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found, creating mock user for testing');
      // Return a mock user for testing
      return res.status(200).json({
        success: true,
        token: mockToken,
        user: {
          id: '60d0fe4f5311236168a109ca',
          email: email,
          firstName: email.includes('doctor') ? 'Doctor' : 'Patient',
          lastName: 'User',
          role: email.includes('doctor') ? UserRole.DOCTOR : UserRole.PATIENT,
          isVerified: true
        }
      });
    }
    
    // If user exists but password doesn't match, accept it anyway for testing
    console.log('User found:', user);
    
    // Create and send token
    const token = user.getSignedJwtToken();

    // Get user profile based on role
    let profile = null;
    if (user.role === UserRole.DOCTOR) {
      profile = await Doctor.findOne({ user: user._id });
    } else if (user.role === UserRole.PATIENT) {
      profile = await Patient.findOne({ user: user._id });
    }

    console.log('Login successful, returning user and token');
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        profileId: profile?._id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user profile based on role
    let profile = null;
    if (user.role === UserRole.DOCTOR) {
      profile = await Doctor.findOne({ user: user._id });
    } else if (user.role === UserRole.PATIENT) {
      profile = await Patient.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        role: user.role,
        isVerified: user.isVerified,
        profileId: profile?._id,
        profile
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
}; 