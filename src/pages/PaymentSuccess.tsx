
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  
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
        <p className="font-medium text-gray-800">TXN128456789</p>
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
