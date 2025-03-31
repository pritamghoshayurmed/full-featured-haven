import { Appointment, DoctorSpecialization, Message, Notification, PaymentMethod, Review, TimeSlot, User, MedicalRecord, PatientHealth, AiAnalysis } from "@/types";

// Doctor specializations
export const specializations: DoctorSpecialization[] = [
  { id: "1", name: "General", icon: "stethoscope" },
  { id: "2", name: "Cardiology", icon: "heart" },
  { id: "3", name: "Pediatric", icon: "baby" },
  { id: "4", name: "Dermatology", icon: "shield" },
  { id: "5", name: "Neurology", icon: "brain" },
  { id: "6", name: "Orthopedic", icon: "bone" },
  { id: "7", name: "Ophthalmology", icon: "eye" },
  { id: "8", name: "Dentistry", icon: "tooth" },
];

// Users (Doctors and Patients)
export const users: User[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "/lovable-uploads/doctor1.png",
    role: "doctor",
    specialization: "Cardiology",
    experience: "10 years",
    rating: 4.8,
    reviews: 125,
    about: "Dr. Sarah Johnson is a board-certified cardiologist with over 10 years of experience. She specializes in cardiovascular diseases and preventive cardiology.",
    address: "123 Medical Center, New York, NY"
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    email: "michael.chen@example.com",
    phone: "+1 (555) 987-6543",
    avatar: "/lovable-uploads/doctor2.png",
    role: "doctor",
    specialization: "Neurology",
    experience: "15 years",
    rating: 4.9,
    reviews: 215,
    about: "Dr. Michael Chen is a renowned neurologist specializing in neurological disorders and neuromuscular diseases. He has published numerous papers in the field.",
    address: "456 Health Avenue, Boston, MA"
  },
  {
    id: "3",
    name: "Dr. Emily Martinez",
    email: "emily.martinez@example.com",
    phone: "+1 (555) 456-7890",
    avatar: "/lovable-uploads/doctor3.png",
    role: "doctor",
    specialization: "Pediatric",
    experience: "8 years",
    rating: 4.7,
    reviews: 98,
    about: "Dr. Emily Martinez is a compassionate pediatrician dedicated to providing high-quality care for children from birth through adolescence.",
    address: "789 Care Lane, Chicago, IL"
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    email: "james.wilson@example.com",
    phone: "+1 (555) 789-0123",
    avatar: "/lovable-uploads/doctor4.png",
    role: "doctor",
    specialization: "Dermatology",
    experience: "12 years",
    rating: 4.6,
    reviews: 156,
    about: "Dr. James Wilson is a dermatologist specializing in skin conditions, cosmetic dermatology, and dermatologic surgery.",
    address: "101 Skin Street, Los Angeles, CA"
  },
  {
    id: "5",
    name: "Dr. Olivia Thompson",
    email: "olivia.thompson@example.com",
    phone: "+1 (555) 234-5678",
    avatar: "/lovable-uploads/doctor5.png",
    role: "doctor",
    specialization: "Orthopedic",
    experience: "14 years",
    rating: 4.9,
    reviews: 178,
    about: "Dr. Olivia Thompson is a skilled orthopedic surgeon specializing in sports injuries, joint replacements, and minimally invasive surgery.",
    address: "202 Bone Boulevard, Denver, CO"
  },
  {
    id: "user1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 111-2222",
    avatar: "/lovable-uploads/patient1.png",
    role: "patient",
    address: "567 Home Avenue, Seattle, WA"
  }
];

// Current logged in user (for demo purposes)
export const currentUser: User = users.find(user => user.id === "user1")!;

// Appointments
export const appointments: Appointment[] = [
  {
    id: "apt1",
    doctorId: "1",
    patientId: "user1",
    date: "2023-11-15",
    time: "10:00 AM",
    status: "confirmed",
    type: "online",
    reason: "Annual checkup",
    paymentStatus: "completed",
    paymentAmount: 150
  },
  {
    id: "apt2",
    doctorId: "3",
    patientId: "user1",
    date: "2023-11-22",
    time: "2:30 PM",
    status: "pending",
    type: "in-person",
    reason: "Follow-up consultation",
    paymentStatus: "pending",
    paymentAmount: 200
  },
  {
    id: "apt3",
    doctorId: "2",
    patientId: "user1",
    date: "2023-12-05",
    time: "9:15 AM",
    status: "confirmed",
    type: "online",
    reason: "Migraine consultation",
    paymentStatus: "completed",
    paymentAmount: 175
  }
];

// Reviews
export const reviews: Review[] = [
  {
    id: "rev1",
    doctorId: "1",
    patientId: "user1",
    rating: 5,
    comment: "Dr. Johnson was very thorough and patient. She explained everything clearly.",
    date: "2023-10-15"
  },
  {
    id: "rev2",
    doctorId: "2",
    patientId: "user1",
    rating: 4,
    comment: "Great doctor, but had to wait a bit longer than expected for my appointment.",
    date: "2023-09-20"
  }
];

// Messages
export const messages: Message[] = [
  {
    id: "msg1",
    senderId: "1",
    receiverId: "user1",
    content: "Hello John, I've reviewed your test results. Everything looks normal, but I'd like to discuss a few things during our next appointment.",
    timestamp: "2023-11-10T14:30:00Z",
    read: true
  },
  {
    id: "msg2",
    senderId: "user1",
    receiverId: "1",
    content: "Thank you, Dr. Johnson. Is there anything I should prepare for our discussion?",
    timestamp: "2023-11-10T14:35:00Z",
    read: true
  },
  {
    id: "msg3",
    senderId: "1",
    receiverId: "user1",
    content: "Just bring any questions you might have. We'll go through everything together during the appointment.",
    timestamp: "2023-11-10T14:40:00Z",
    read: false
  },
  {
    id: "msg4",
    senderId: "3",
    receiverId: "user1",
    content: "Hi John, just a reminder that your appointment is scheduled for tomorrow at 2:30 PM. Please arrive 15 minutes early to complete any paperwork.",
    timestamp: "2023-11-21T09:00:00Z",
    read: false
  }
];

// Notifications
export const notifications: Notification[] = [
  {
    id: "notif1",
    userId: "user1",
    title: "Appointment Reminder",
    message: "Your appointment with Dr. Sarah Johnson is tomorrow at 10:00 AM.",
    timestamp: "2023-11-14T10:00:00Z",
    read: false,
    type: "appointment",
    relatedId: "apt1"
  },
  {
    id: "notif2",
    userId: "user1",
    title: "New Message",
    message: "You have a new message from Dr. Sarah Johnson.",
    timestamp: "2023-11-10T14:40:00Z",
    read: true,
    type: "message",
    relatedId: "msg3"
  },
  {
    id: "notif3",
    userId: "user1",
    title: "Payment Received",
    message: "Your payment of $150 for appointment #apt1 has been processed.",
    timestamp: "2023-11-08T15:20:00Z",
    read: true,
    type: "payment",
    relatedId: "apt1"
  }
];

// Time slots
export const timeSlots: TimeSlot[] = [
  { id: "ts1", doctorId: "1", time: "9:00 AM", date: "2023-11-20", isAvailable: true },
  { id: "ts2", doctorId: "1", time: "10:00 AM", date: "2023-11-20", isAvailable: true },
  { id: "ts3", doctorId: "1", time: "11:00 AM", date: "2023-11-20", isAvailable: false },
  { id: "ts4", doctorId: "1", time: "1:00 PM", date: "2023-11-20", isAvailable: true },
  { id: "ts5", doctorId: "1", time: "2:00 PM", date: "2023-11-20", isAvailable: true },
  { id: "ts6", doctorId: "1", time: "3:00 PM", date: "2023-11-20", isAvailable: false },
  { id: "ts7", doctorId: "1", time: "9:00 AM", date: "2023-11-21", isAvailable: true },
  { id: "ts8", doctorId: "1", time: "10:00 AM", date: "2023-11-21", isAvailable: false },
  { id: "ts9", doctorId: "1", time: "11:00 AM", date: "2023-11-21", isAvailable: true },
  { id: "ts10", doctorId: "1", time: "1:00 PM", date: "2023-11-21", isAvailable: true },
  { id: "ts11", doctorId: "1", time: "2:00 PM", date: "2023-11-21", isAvailable: true },
  { id: "ts12", doctorId: "1", time: "3:00 PM", date: "2023-11-21", isAvailable: true },
];

// Payment methods
export const paymentMethods: PaymentMethod[] = [
  {
    id: "pm1",
    userId: "user1",
    type: "credit",
    name: "Visa ending in 4242",
    last4: "4242",
    expiryDate: "12/25",
    isDefault: true
  },
  {
    id: "pm2",
    userId: "user1",
    type: "paypal",
    name: "PayPal - john.smith@example.com",
    isDefault: false
  },
  {
    id: "pm3",
    userId: "user1",
    type: "insurance",
    name: "Blue Cross Blue Shield",
    isDefault: false
  }
];

// Medical Records
export const medicalRecords: MedicalRecord[] = [
  {
    id: "rec1",
    patientId: "user1",
    doctorId: "1",
    date: "2023-10-15",
    type: "prescription",
    title: "Hypertension Medication",
    description: "Prescription for Lisinopril 10mg, once daily.",
    fileUrl: "/lovable-uploads/prescription1.pdf",
    isPrivate: false
  },
  {
    id: "rec2",
    patientId: "user1",
    doctorId: "2",
    date: "2023-09-20",
    type: "diagnosis",
    title: "Migraine Assessment",
    description: "Patient presented with recurring migraines. Recommended treatment plan and lifestyle changes.",
    notes: "Patient should avoid triggers like caffeine and maintain regular sleep schedule.",
    isPrivate: false
  },
  {
    id: "rec3",
    patientId: "user1",
    doctorId: "3",
    date: "2023-11-05",
    type: "lab_result",
    title: "Blood Test Results",
    description: "Complete blood count and lipid profile results.",
    fileUrl: "/lovable-uploads/bloodtest.pdf",
    notes: "Cholesterol slightly elevated. Recommended dietary changes.",
    isPrivate: true
  },
  {
    id: "rec4",
    patientId: "user1",
    doctorId: "4",
    date: "2023-10-30",
    type: "report",
    title: "Skin Examination",
    description: "Annual skin cancer screening report.",
    notes: "No concerning lesions found. Recommended annual follow-up.",
    isPrivate: false
  }
];

// Patient Health Profiles
export const patientHealthProfiles: PatientHealth[] = [
  {
    id: "health1",
    patientId: "user1",
    healthMetrics: {
      height: 175,
      weight: 72,
      bloodPressure: "130/85",
      bloodSugar: 95,
      heartRate: 72,
      temperature: 36.6,
      oxygenLevel: 98
    },
    allergies: ["Penicillin", "Peanuts"],
    chronicConditions: ["Hypertension", "Migraine"],
    medications: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        startDate: "2023-09-01"
      },
      {
        name: "Sumatriptan",
        dosage: "50mg",
        frequency: "As needed for migraine",
        startDate: "2023-08-15"
      }
    ],
    familyHistory: "Father had hypertension, Mother had diabetes type 2",
    lastUpdated: "2023-11-10"
  }
];

// AI Analyses
export const aiAnalyses: AiAnalysis[] = [
  {
    id: "ai1",
    medicalRecordId: "rec3",
    generatedDate: "2023-11-06",
    summary: "Blood test results show slightly elevated cholesterol levels but otherwise normal values across all markers.",
    keyFindings: [
      "Total cholesterol: 210 mg/dL (borderline high)",
      "LDL cholesterol: 130 mg/dL (borderline high)",
      "HDL cholesterol: 45 mg/dL (good)",
      "Triglycerides: 150 mg/dL (normal)"
    ],
    recommendations: [
      "Consider dietary modifications to reduce cholesterol intake",
      "Increase physical activity to at least 150 minutes per week",
      "Follow up blood test in 3 months to monitor progress"
    ],
    abnormalResults: ["Total cholesterol", "LDL cholesterol"],
    confidence: 0.92
  }
];

// Get time slots for a specific doctor and date
export const getTimeSlotsByDoctorAndDate = (doctorId: string, date: string): TimeSlot[] => {
  // Generate current hour and add 1 to start from next hour
  const currentHour = new Date().getHours();
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Generate time slots from 8 AM to 8 PM
  const slots: TimeSlot[] = [];
  
  // For demo purposes, create 10 slots with most being available
  for (let i = 8; i <= 18; i++) {
    // Format time as HH:00 AM/PM
    const hour = i > 12 ? i - 12 : i;
    const ampm = i >= 12 ? 'PM' : 'AM';
    const time = `${hour}:00 ${ampm}`;
    
    // Make slots in the past unavailable
    const isAvailable = date > currentDate || (date === currentDate && i > currentHour);
    
    slots.push({
      id: `${doctorId}-${date}-${i}`,
      doctorId,
      date,
      time,
      isAvailable,
    });
  }
  
  return slots;
};

// Get appointments for a specific user
export const getUserAppointments = (userId: string): Appointment[] => {
  return appointments.filter(apt => apt.patientId === userId);
};

// Get messages for a conversation between two users
export const getConversationMessages = (user1: string, user2: string): Message[] => {
  return messages.filter(
    msg => (msg.senderId === user1 && msg.receiverId === user2) || 
           (msg.senderId === user2 && msg.receiverId === user1)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Get user notifications
export const getUserNotifications = (userId: string): Notification[] => {
  return notifications.filter(notif => notif.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Get user payment methods
export const getUserPaymentMethods = (userId: string): PaymentMethod[] => {
  return paymentMethods.filter(pm => pm.userId === userId);
};

// Get doctor by ID
export const getDoctorById = (id: string): User | undefined => {
  return users.find(user => user.id === id && user.role === 'doctor');
};

// Get all doctors
export const getAllDoctors = (): User[] => {
  return users.filter(user => user.role === 'doctor');
};

// Get all users
export const getAllUsers = (): User[] => {
  return users;
};

// Helper functions
export const getUserMedicalRecords = (patientId: string): MedicalRecord[] => {
  return medicalRecords.filter(record => record.patientId === patientId);
};

export const getPatientHealthProfile = (patientId: string): PatientHealth | undefined => {
  return patientHealthProfiles.find(profile => profile.patientId === patientId);
};

export const getRecordAnalysis = (recordId: string): AiAnalysis | undefined => {
  return aiAnalyses.find(analysis => analysis.medicalRecordId === recordId);
};
