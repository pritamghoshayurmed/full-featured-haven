import axios from 'axios';
import axiosInstance from '@/lib/axios';
import { User } from '@/types';

// Set token in localstorage and axios headers
const setAuthToken = (token: string) => {
  if (token) {
    localStorage.setItem('token', token);
    // Configure the global axios instance (this is still needed for other services)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Our axios instance headers are set automatically through interceptors
  } else {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Initialize auth headers from storage
const initializeAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
    return true;
  }
  return false;
};

// Login user
const login = async (email: string, password: string) => {
  try {
    console.log('Attempting to login with:', { email });
    const response = await axiosInstance.post('/auth/login', { email, password });
    
    console.log('Login response:', response.data);
    
    if (response.data.success && response.data.token) {
      setAuthToken(response.data.token);
      
      // Transform backend user to app user format
      const userData = response.data.user;
      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phoneNumber || '',
        avatar: userData.profilePicture || '',
        role: userData.role,
        isVerified: userData.isVerified || true,
        profileId: userData.profileId
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token: response.data.token };
    }
    
    throw new Error('Login failed');
  } catch (error: any) {
    console.error('Login error:', error);
    // FOR TESTING: If the server is unreachable, create a mock login
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, creating mock login');
      const mockUser: User = {
        id: 'mock-user-id',
        email: email,
        firstName: email.includes('doctor') ? 'Doctor' : 'Patient',
        lastName: 'Test',
        name: email.includes('doctor') ? 'Doctor Test' : 'Patient Test',
        phone: '',
        role: email.includes('doctor') ? 'doctor' : 'patient',
        isVerified: true
      };
      
      const mockToken = 'mock-token-for-test';
      setAuthToken(mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return { user: mockUser, token: mockToken };
    }
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Authentication failed');
    }
    throw error;
  }
};

// Register user
const register = async (name: string, email: string, password: string, phone: string, role: string = 'patient') => {
  try {
    // Split the name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const userData = {
      email,
      password,
      firstName,
      lastName,
      phoneNumber: phone,
      role
    };
    
    console.log('Attempting to register with:', { email });
    const response = await axiosInstance.post('/auth/register', userData);
    
    console.log('Registration response:', response.data);
    
    if (response.data.success && response.data.token) {
      setAuthToken(response.data.token);
      
      // Transform backend user to app user format
      const userData = response.data.user;
      const user: User = {
        id: userData.id,
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phoneNumber || '',
        avatar: userData.profilePicture || '',
        role: userData.role,
        isVerified: userData.isVerified || true,
        profileId: userData.profileId
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token: response.data.token };
    }
    
    throw new Error('Registration failed');
  } catch (error: any) {
    console.error('Registration error:', error);
    // FOR TESTING: If the server is unreachable, create a mock registration
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, creating mock registration');
      const mockUser: User = {
        id: 'mock-user-id',
        email: email,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
        name: name,
        phone: phone,
        role: role,
        isVerified: true
      };
      
      const mockToken = 'mock-token-for-test';
      setAuthToken(mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return { user: mockUser, token: mockToken };
    }
    
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw error;
  }
};

// Logout user
const logout = () => {
  setAuthToken('');
  localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  initializeAuth
};

export default authService; 