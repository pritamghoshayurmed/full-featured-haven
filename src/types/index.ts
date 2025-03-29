
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'patient' | 'doctor' | 'admin';
  specialization?: string;
  experience?: string;
  rating?: number;
  reviews?: number;
  about?: string;
  address?: string;
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
