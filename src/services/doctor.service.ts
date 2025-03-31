import axios from 'axios';
import axiosInstance from '@/lib/axios';

const API_URL = 'http://localhost:8000/api';

const mockDoctors = [
  {
    id: "1",
    name: "Dr. Rajesh Kumar",
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "dr.rajesh.kumar@example.com",
    specialization: "Cardiologist",
    experience: 15,
    location: "Mumbai, Maharashtra",
    fee: 1500,
    rating: 4.8,
    reviews: 124,
    availability: "Available Today",
    profilePicture: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    id: "2",
    name: "Dr. Priya Sharma",
    firstName: "Priya",
    lastName: "Sharma",
    email: "dr.priya.sharma@example.com",
    specialization: "Pediatrician",
    experience: 12,
    location: "Delhi, NCR",
    fee: 1200,
    rating: 4.7,
    reviews: 98,
    availability: "Available Tomorrow",
    profilePicture: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    id: "3",
    name: "Dr. Ajay Patel",
    firstName: "Ajay",
    lastName: "Patel",
    email: "dr.ajay.patel@example.com",
    specialization: "Orthopedic Surgeon",
    experience: 18,
    location: "Bangalore, Karnataka",
    fee: 1800,
    rating: 4.9,
    reviews: 156,
    availability: "Available Today",
    profilePicture: "https://randomuser.me/api/portraits/men/3.jpg"
  },
  {
    id: "4",
    name: "Dr. Sunita Reddy",
    firstName: "Sunita",
    lastName: "Reddy",
    email: "dr.sunita.reddy@example.com",
    specialization: "Gynecologist",
    experience: 14,
    location: "Hyderabad, Telangana",
    fee: 1400,
    rating: 4.6,
    reviews: 87,
    availability: "Available in 2 days",
    profilePicture: "https://randomuser.me/api/portraits/women/4.jpg"
  },
  {
    id: "5",
    name: "Dr. Vikram Singh",
    firstName: "Vikram",
    lastName: "Singh",
    email: "dr.vikram.singh@example.com",
    specialization: "Dermatologist",
    experience: 10,
    location: "Kolkata, West Bengal",
    fee: 1300,
    rating: 4.5,
    reviews: 76,
    availability: "Available Today",
    profilePicture: "https://randomuser.me/api/portraits/men/5.jpg"
  }
];

// Get all doctors
const getAllDoctors = async () => {
  try {
    const response = await axiosInstance.get('/doctors');
    console.log('Doctors loaded from database:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock doctors');
      return mockDoctors;
    }
    throw error;
  }
};

// Get top rated doctors
const getTopDoctors = async () => {
  try {
    const response = await axiosInstance.get('/doctors/top');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching top doctors:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock top doctors');
      // Sort the mock doctors by rating and return top ones
      return [...mockDoctors].sort((a, b) => b.rating - a.rating).slice(0, 4);
    }
    throw error;
  }
};

// Get doctor by ID
const getDoctorById = async (doctorId: string) => {
  try {
    const response = await axiosInstance.get(`/doctors/${doctorId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching doctor:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock doctor');
      const mockDoctor = mockDoctors.find(d => d.id === doctorId);
      return mockDoctor || {
        id: doctorId,
        name: "Dr. Unknown",
        firstName: "Unknown",
        lastName: "Doctor",
        email: "unknown@example.com",
        specialization: "General Medicine",
        experience: 5,
        location: "Unknown Location",
        fee: 1000,
        rating: 4.0,
        reviews: 0,
        availability: "Contact for availability",
        profilePicture: "https://randomuser.me/api/portraits/men/0.jpg"
      };
    }
    throw error;
  }
};

// Get doctor's available time slots
const getDoctorTimeSlots = async (doctorId: string, date: string) => {
  try {
    const response = await axiosInstance.get(`/doctors/${doctorId}/availability`, {
      params: { date }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching doctor time slots:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock time slots');
      // Generate some mock time slots between 9 AM and 5 PM
      const timeSlots = [];
      const mockDate = new Date(date);
      
      for (let hour = 9; hour < 17; hour++) {
        // Skip some slots randomly to simulate unavailability
        if (Math.random() > 0.3) {
          timeSlots.push({
            id: `mock-slot-${hour}`,
            startTime: `${hour}:00`,
            endTime: `${hour}:30`,
            date: mockDate.toISOString().split('T')[0],
            isAvailable: true
          });
        }
        
        if (Math.random() > 0.3) {
          timeSlots.push({
            id: `mock-slot-${hour}-30`,
            startTime: `${hour}:30`,
            endTime: `${hour + 1}:00`,
            date: mockDate.toISOString().split('T')[0],
            isAvailable: true
          });
        }
      }
      
      return timeSlots;
    }
    throw error;
  }
};

// Get doctor reviews
const getDoctorReviews = async (doctorId: string) => {
  try {
    const response = await axiosInstance.get(`/doctors/${doctorId}/reviews`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching doctor reviews:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock reviews');
      // Generate 5 mock reviews
      return Array(5).fill(null).map((_, i) => ({
        id: `mock-review-${i}`,
        rating: 3 + Math.floor(Math.random() * 3), // Random rating between 3-5
        comment: [
          "Great doctor, very knowledgeable and professional.",
          "The doctor was patient and listened to all my concerns.",
          "Excellent experience, would recommend to others.",
          "Very satisfied with the consultation.",
          "Doctor explained everything clearly and answered all my questions."
        ][i],
        patientName: ["Rahul S.", "Anjali K.", "Deepak M.", "Meera P.", "Sandeep R."][i],
        date: new Date(Date.now() - (i * 86400000)).toISOString() // Different dates for each review
      }));
    }
    throw error;
  }
};

export const doctorService = {
  getAllDoctors,
  getTopDoctors,
  getDoctorById,
  getDoctorTimeSlots,
  getDoctorReviews
};

export default doctorService; 