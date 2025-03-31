export interface User {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  avatar?: string;
  role: 'patient' | 'doctor' | 'admin';
  specialization?: string;
  experience?: string;
  rating?: number;
  reviews?: number;
  about?: string;
  address?: string;
  isVerified?: boolean;
  profileId?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'online' | 'in-person';
  reason?: string;
  notes?: string;
  paymentStatus: 'pending' | 'completed';
  paymentAmount: number;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'appointment' | 'message' | 'payment' | 'system';
  relatedId?: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  time: string;
  date: string;
  isAvailable: boolean;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'credit' | 'paypal' | 'insurance';
  name: string;
  last4?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface DoctorSpecialization {
  id: string;
  name: string;
  icon: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  type: 'prescription' | 'report' | 'diagnosis' | 'lab_result';
  title: string;
  description: string;
  fileUrl?: string;
  notes?: string;
  isPrivate: boolean;
}

export interface PatientHealth {
  id: string;
  patientId: string;
  healthMetrics: {
    height?: number; // in cm
    weight?: number; // in kg
    bloodPressure?: string; // e.g. "120/80"
    bloodSugar?: number; // in mg/dL
    heartRate?: number; // in bpm
    temperature?: number; // in Celsius
    oxygenLevel?: number; // in percentage
  };
  allergies: string[];
  chronicConditions: string[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
  }[];
  familyHistory?: string;
  lastUpdated: string;
}

export interface AiAnalysis {
  id: string;
  medicalRecordId: string;
  generatedDate: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  abnormalResults?: string[];
  confidence: number; // 0-1 scale
}
