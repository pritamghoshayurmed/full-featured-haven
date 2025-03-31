import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth pages
import Welcome from "@/pages/auth/Welcome";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import OtpVerification from "@/pages/auth/OtpVerification";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// Main app pages
import Dashboard from "@/pages/Dashboard";
import DoctorList from "@/pages/DoctorList";
import DoctorDetail from "@/pages/DoctorDetail";
import BookAppointment from "@/pages/BookAppointment";
import AppointmentConfirmation from "@/pages/AppointmentConfirmation";
import PaymentMethods from "@/pages/PaymentMethods";
import PaymentCheckout from "@/pages/PaymentCheckout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Appointments from "@/pages/Appointments";
import Notifications from "@/pages/Notifications";
import Chat from "@/pages/Chat";
import ChatDetail from "@/pages/ChatDetail";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import DoctorDashboard from "@/pages/doctor/DoctorDashboard";
import DoctorAiAssistant from "@/pages/doctor/AiAssistant";
import DoctorAnalytics from "@/pages/doctor/Analytics";
import PatientRecords from "@/pages/doctor/PatientRecords";
import DoctorAppointments from "@/pages/doctor/DoctorAppointments";
import DoctorChat from "@/pages/doctor/DoctorChat";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AiAssistant from "@/pages/AiAssistant";
import AIChat from "@/pages/AIChat";
import DoctorsList from "@/pages/DoctorsList";
import Layout from "@/components/Layout";

// 404 page
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ChatProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <Routes>
              {/* Auth routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/otp-verification" element={<OtpVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/appointments" element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                } />
                
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                
                <Route path="/chat/:chatId" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                
                <Route path="/ai" element={
                  <ProtectedRoute>
                    <AIChat />
                  </ProtectedRoute>
                } />
                
                <Route path="/ai/:chatId" element={
                  <ProtectedRoute>
                    <AIChat />
                  </ProtectedRoute>
                } />
                
                <Route path="/doctors" element={
                  <ProtectedRoute>
                    <DoctorsList />
                  </ProtectedRoute>
                } />
                
                <Route path="/doctors/:id" element={<DoctorDetail />} />
                <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
                <Route path="/appointment-confirmation" element={<AppointmentConfirmation />} />
                <Route path="/payment-methods" element={<PaymentMethods />} />
                <Route path="/payment-checkout/:appointmentId" element={<PaymentCheckout />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/chat/:id" element={<ChatDetail />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/ai-assistant" element={<AiAssistant />} />
                
                {/* Doctor routes */}
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/ai-assistant" element={<DoctorAiAssistant />} />
                <Route path="/doctor/analytics" element={<DoctorAnalytics />} />
                <Route path="/doctor/patients" element={<PatientRecords />} />
                <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                <Route path="/doctor/chat" element={<DoctorChat />} />
                
                {/* Admin routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </ChatProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
