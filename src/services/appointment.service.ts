import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Mock appointments data for fallback
const mockAppointments = [
  {
    id: "a1",
    patientId: "p1",
    doctorId: "1", // Dr. Rajesh Kumar
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    time: "10:00 AM",
    status: "confirmed",
    type: "online",
    reason: "Regular checkup"
  },
  {
    id: "a2",
    patientId: "p1",
    doctorId: "3", // Dr. Ajay Patel
    date: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 days from now
    time: "2:30 PM",
    status: "confirmed",
    type: "in-person",
    reason: "Follow-up consultation"
  },
  {
    id: "a3",
    patientId: "p1",
    doctorId: "5", // Dr. Vikram Singh
    date: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
    time: "11:15 AM",
    status: "completed",
    type: "online",
    reason: "Skin concerns"
  },
  {
    id: "a4",
    patientId: "p1",
    doctorId: "2", // Dr. Priya Sharma
    date: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
    time: "4:00 PM",
    status: "completed",
    type: "online",
    reason: "Child vaccination"
  }
];

// Get user appointments (for patient)
const getUserAppointments = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/patients/${userId}/appointments`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching user appointments:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock appointments');
      return mockAppointments.filter(apt => apt.patientId === userId);
    }
    throw error;
  }
};

// Get doctor appointments
const getDoctorAppointments = async (doctorId: string) => {
  try {
    const response = await axios.get(`${API_URL}/doctors/${doctorId}/appointments`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching doctor appointments:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock appointments');
      return mockAppointments.filter(apt => apt.doctorId === doctorId);
    }
    throw error;
  }
};

// Get appointment by ID
const getAppointmentById = async (appointmentId: string) => {
  try {
    const response = await axios.get(`${API_URL}/appointments/${appointmentId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock appointment');
      return mockAppointments.find(apt => apt.id === appointmentId);
    }
    throw error;
  }
};

// Create a new appointment
const createAppointment = async (appointmentData: any) => {
  try {
    const response = await axios.post(`${API_URL}/appointments`, appointmentData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Cancel an appointment
const cancelAppointment = async (appointmentId: string) => {
  try {
    const response = await axios.put(`${API_URL}/appointments/${appointmentId}/cancel`);
    return response.data.data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

// Reschedule an appointment
const rescheduleAppointment = async (appointmentId: string, newData: { date: string, time: string }) => {
  try {
    const response = await axios.put(`${API_URL}/appointments/${appointmentId}/reschedule`, newData);
    return response.data.data;
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    throw error;
  }
};

export const appointmentService = {
  getUserAppointments,
  getDoctorAppointments,
  getAppointmentById,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment
};

export default appointmentService; 