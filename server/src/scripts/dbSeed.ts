import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/user.model';
import Doctor from '../models/doctor.model';
import Patient from '../models/patient.model';
import { Gender, BloodType } from '../models/patient.model';

// Load environment variables
dotenv.config();

// Sample data
const doctors = [
  {
    email: 'dr.rajesh.kumar@example.com',
    password: 'password123',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    role: UserRole.DOCTOR,
    phoneNumber: '+91 9876543210',
    profilePicture: 'https://randomuser.me/api/portraits/men/45.jpg',
    specialization: 'Cardiology',
    qualifications: ['MBBS', 'MD - Cardiology', 'DM - Cardiology'],
    experience: 15,
    licenseNumber: 'MCI-11111',
    hospitalAffiliations: ['Apollo Hospitals', 'Fortis Healthcare'],
    consultationFee: 1500,
    bio: 'Experienced cardiologist with expertise in interventional cardiology and cardiac electrophysiology.',
    address: {
      street: '121 Park Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    availability: [
      {
        day: 'Monday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Friday',
        startTime: '09:00',
        endTime: '14:00'
      }
    ],
    isAvailableForConsultation: true
  },
  {
    email: 'dr.sharma@example.com',
    password: 'password123',
    firstName: 'Aditya',
    lastName: 'Sharma',
    role: UserRole.DOCTOR,
    phoneNumber: '+91 9876543210',
    profilePicture: 'https://randomuser.me/api/portraits/men/45.jpg',
    specialization: 'Cardiology',
    qualifications: ['MBBS', 'MD - Cardiology', 'DM - Cardiology'],
    experience: 15,
    licenseNumber: 'MCI-22222',
    hospitalAffiliations: ['Apollo Hospitals', 'Fortis Healthcare'],
    consultationFee: 1500,
    bio: 'Experienced cardiologist with expertise in interventional cardiology and cardiac electrophysiology.',
    address: {
      street: '121 Park Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    availability: [
      {
        day: 'Monday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Friday',
        startTime: '09:00',
        endTime: '14:00'
      }
    ],
    isAvailableForConsultation: true
  },
  {
    email: 'dr.patel@example.com',
    password: 'password123',
    firstName: 'Nisha',
    lastName: 'Patel',
    role: UserRole.DOCTOR,
    phoneNumber: '+91 9876543211',
    profilePicture: 'https://randomuser.me/api/portraits/women/32.jpg',
    specialization: 'Dermatology',
    qualifications: ['MBBS', 'MD - Dermatology'],
    experience: 8,
    licenseNumber: 'MCI-23456',
    hospitalAffiliations: ['Max Healthcare', 'Medanta'],
    consultationFee: 1200,
    bio: 'Skilled dermatologist specializing in cosmetic dermatology and skin cancer treatment.',
    address: {
      street: '45 Green Park',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110016',
      country: 'India'
    },
    availability: [
      {
        day: 'Monday',
        startTime: '10:00',
        endTime: '18:00'
      },
      {
        day: 'Thursday',
        startTime: '10:00',
        endTime: '18:00'
      },
      {
        day: 'Saturday',
        startTime: '10:00',
        endTime: '15:00'
      }
    ],
    isAvailableForConsultation: true
  },
  {
    email: 'dr.singh@example.com',
    password: 'password123',
    firstName: 'Rajinder',
    lastName: 'Singh',
    role: UserRole.DOCTOR,
    phoneNumber: '+91 9876543212',
    profilePicture: 'https://randomuser.me/api/portraits/men/67.jpg',
    specialization: 'Orthopedics',
    qualifications: ['MBBS', 'MS - Orthopedics', 'DNB - Orthopedics'],
    experience: 12,
    licenseNumber: 'MCI-34567',
    hospitalAffiliations: ['AIIMS', 'Artemis Hospital'],
    consultationFee: 1300,
    bio: 'Orthopedic surgeon specializing in joint replacement surgeries and sports injuries.',
    address: {
      street: '78 Model Town',
      city: 'Chandigarh',
      state: 'Punjab',
      zipCode: '160022',
      country: 'India'
    },
    availability: [
      {
        day: 'Tuesday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Thursday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Saturday',
        startTime: '09:00',
        endTime: '13:00'
      }
    ],
    isAvailableForConsultation: true
  }
];

const patients = [
  {
    email: 'amit.kumar@example.com',
    password: 'password123',
    firstName: 'Amit',
    lastName: 'Kumar',
    role: UserRole.PATIENT,
    phoneNumber: '+91 9876543213',
    profilePicture: 'https://randomuser.me/api/portraits/men/22.jpg',
    dateOfBirth: '1985-05-15',
    gender: 'male',
    bloodType: 'O+',
    height: 175,
    weight: 72,
    allergies: ['Penicillin', 'Dust'],
    chronicConditions: ['Hypertension'],
    address: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    }
  },
  {
    email: 'priya.sharma@example.com',
    password: 'password123',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: UserRole.PATIENT,
    phoneNumber: '+91 9876543214',
    profilePicture: 'https://randomuser.me/api/portraits/women/28.jpg',
    dateOfBirth: '1992-08-21',
    gender: 'female',
    bloodType: 'B+',
    height: 165,
    weight: 58,
    allergies: ['Shellfish'],
    chronicConditions: ['Asthma'],
    address: {
      street: '45 Civil Lines',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411001',
      country: 'India'
    }
  }
];

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!, {
    dbName: 'healthcare_app'
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully');
    seedDatabase();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create doctors
    for (const doctorData of doctors) {
      // Create user account
      const hashedPassword = await bcrypt.hash(doctorData.password, 10);
      
      const user = new User({
        email: doctorData.email,
        password: hashedPassword,
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        role: doctorData.role,
        phoneNumber: doctorData.phoneNumber,
        profilePicture: doctorData.profilePicture,
        isVerified: true
      });
      
      await user.save();
      
      // Create doctor profile
      const doctor = new Doctor({
        user: user._id,
        specialization: doctorData.specialization,
        qualifications: doctorData.qualifications,
        experience: doctorData.experience,
        hospitalAffiliations: doctorData.hospitalAffiliations,
        licenseNumber: doctorData.licenseNumber,
        consultationFee: doctorData.consultationFee,
        bio: doctorData.bio,
        address: doctorData.address,
        availability: doctorData.availability,
        isAvailableForConsultation: doctorData.isAvailableForConsultation
      });
      
      await doctor.save();
      
      console.log(`Doctor created: ${doctorData.firstName} ${doctorData.lastName}`);
    }
    
    // Create patients
    for (const patientData of patients) {
      // Create user account
      const hashedPassword = await bcrypt.hash(patientData.password, 10);
      
      const user = new User({
        email: patientData.email,
        password: hashedPassword,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        role: patientData.role,
        phoneNumber: patientData.phoneNumber,
        profilePicture: patientData.profilePicture,
        isVerified: true
      });
      
      await user.save();
      
      // Create patient profile
      const patient = new Patient({
        user: user._id,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        bloodType: patientData.bloodType,
        height: patientData.height,
        weight: patientData.weight,
        allergies: patientData.allergies,
        chronicConditions: patientData.chronicConditions,
        address: patientData.address
      });
      
      await patient.save();
      
      console.log(`Patient created: ${patientData.firstName} ${patientData.lastName}`);
    }
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}; 