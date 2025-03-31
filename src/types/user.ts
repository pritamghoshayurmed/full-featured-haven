export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  profilePicture?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientProfile {
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  medications?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  medicalHistory?: string;
}

export interface DoctorProfile {
  specialization?: string;
  experience?: number;
  qualifications?: string[];
  clinicName?: string;
  clinicAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  consultationFee?: number;
  availability?: {
    days?: string[];
    timeSlots?: {
      from: string;
      to: string;
    }[];
  };
  ratings?: number;
  reviews?: number;
  bio?: string;
  languagesSpoken?: string[];
}

export interface UserWithProfile extends User {
  patientProfile?: PatientProfile;
  doctorProfile?: DoctorProfile;
} 