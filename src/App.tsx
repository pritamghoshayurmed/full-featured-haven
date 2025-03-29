
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AiAssistant from "@/pages/AiAssistant";

// 404 page
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/doctors" element={<DoctorList />} />
              <Route path="/doctors/:id" element={<DoctorDetail />} />
              <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
              <Route path="/appointment-confirmation" element={<AppointmentConfirmation />} />
              <Route path="/payment-methods" element={<PaymentMethods />} />
              <Route path="/payment-checkout/:appointmentId" element={<PaymentCheckout />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:id" element={<ChatDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/ai-assistant" element={<AiAssistant />} />
              
              {/* Doctor routes */}
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              
              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
