
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { currentUser } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  verifyOTP: (otp: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication token
    const storedUser = localStorage.getItem("meduser");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("meduser");
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API endpoint
      // For demo, we'll just simulate a delay and return the mock current user
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (email !== currentUser.email) {
        throw new Error("Invalid email or password");
      }
      
      setUser(currentUser);
      localStorage.setItem("meduser", JSON.stringify(currentUser));
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock new user
      const newUser: User = {
        ...currentUser,
        name,
        email,
        phone
      };
      
      setUser(newUser);
      localStorage.setItem("meduser", JSON.stringify(newUser));
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("meduser");
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
      // In a real app, this would send a reset email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (email !== currentUser.email) {
        throw new Error("Email not found");
      }
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
      // In a real app, this would validate the token and update the password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!token || token.length < 10) {
        throw new Error("Invalid token");
      }
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
