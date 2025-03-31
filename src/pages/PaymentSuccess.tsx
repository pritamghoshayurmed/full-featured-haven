import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appointmentService } from "@/services/appointment.service";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId, appointmentId } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!appointmentId) return;
      
      try {
        setIsLoading(true);
        const appointmentData = await appointmentService.getAppointmentById(appointmentId);
        setAppointment(appointmentData);
      } catch (err) {
        console.error('Error fetching appointment details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointmentDetails();
  }, [appointmentId]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading appointment details...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-white">
      <div className="bg-blue-500 rounded-full p-5 mb-6">
        <Check className="h-12 w-12 text-white" />
      </div>
      
      <h1 className="text-2xl font-bold mb-3 text-center">Congratulations!</h1>
      
      <p className="text-gray-600 text-center mb-6">
        Your payment has been processed successfully and your appointment has been confirmed.
      </p>
      
      <div className="w-full max-w-xs mb-8 text-center">
        <p className="text-gray-500 mb-2">Transaction ID</p>
        <p className="font-medium text-gray-800">{transactionId || "TXN" + Date.now()}</p>
        
        {appointment && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-gray-500 mb-2">Appointment With</p>
            <p className="font-medium text-gray-800">
              {appointment.doctor?.name || "Your Doctor"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime || appointment.time}
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-4 w-full max-w-xs">
        <Button 
          className="w-full py-6"
          onClick={() => navigate("/appointments")}
        >
          View My Appointments
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full py-6"
          onClick={() => navigate("/dashboard")}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
