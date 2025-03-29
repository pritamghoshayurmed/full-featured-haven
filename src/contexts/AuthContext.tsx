
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyOTP: (otp: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Transform Supabase user to app user format
          const appUser: User = {
            id: currentSession.user.id,
            name: currentSession.user.user_metadata.name || 'User',
            email: currentSession.user.email || '',
            phone: currentSession.user.phone || currentSession.user.user_metadata.phone || '',
            avatar: currentSession.user.user_metadata.avatar_url || '',
            role: currentSession.user.user_metadata.role || 'patient', // Add the role with default value
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        // Transform Supabase user to app user format
        const appUser: User = {
          id: currentSession.user.id,
          name: currentSession.user.user_metadata.name || 'User',
          email: currentSession.user.email || '',
          phone: currentSession.user.phone || currentSession.user.user_metadata.phone || '',
          avatar: currentSession.user.user_metadata.avatar_url || '',
          role: currentSession.user.user_metadata.role || 'patient', // Add the role with default value
        };
        setUser(appUser);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          }
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed", error);
    }
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
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
      // In Supabase, password reset happens through a dedicated page that handles the token
      // This function is maintained for API compatibility but would need to be refactored
      // for a complete Supabase implementation
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
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
