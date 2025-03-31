import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import authService from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, role?: string) => Promise<void>;
  logout: () => void;
  verifyOTP: (otp: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = authService.initializeAuth();
    
    if (isLoggedIn) {
      const userData = authService.getCurrentUser();
      setUser(userData);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string = 'patient') => {
    setIsLoading(true);
    
    try {
      // Role is only used for client-side navigation, not sent to the backend
      const result = await authService.login(email, password);
      console.log('Login successful:', result);
      setUser(result.user);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone: string, role: string = 'patient') => {
    setIsLoading(true);
    
    try {
      const result = await authService.register(name, email, password, phone, role);
      setUser(result.user);
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const verifyOTP = async (otp: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would validate the OTP with a backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - accept any 6-digit OTP
      if (otp.length !== 6) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("OTP verification failed", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      // For now, just mock the forgot password functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Forgot password for:", email);
    } catch (error) {
      console.error("Forgot password failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true);
    
    try {
      // For now, just mock the reset password functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Reset password with token:", token);
    } catch (error) {
      console.error("Reset password failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        register, 
        logout, 
        verifyOTP, 
        forgotPassword, 
        resetPassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
