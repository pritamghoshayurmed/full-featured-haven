
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Check, MapPin, Video } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getDoctorById } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";

export default function AppointmentConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get data from state
  const { 
    doctorId, 
    date, 
    time, 
    type, 
    reason 
  } = location.state || {};
  
  // Get doctor details
  const doctor = getDoctorById(doctorId);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // If no data is found, show error
  if (!doctor || !date || !time) {
    return (
      <AppLayout title="Confirmation">
        <div className="p-4 text-center">
          <p className="mb-4">Appointment details not found</p>
          <Button 
            onClick={() => navigate("/doctors")} 
            className="mt-2"
          >
            Find a Doctor
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  // Handler for payment
  const handleProceedToPayment = () => {
    // In a real app, this would create an appointment and redirect to payment
    // For this demo, we'll simulate creating an appointment and navigate to payment
    navigate("/payment-checkout/apt123");
  };
  
  return (
    <AppLayout title="Confirmation">
      <div className="p-4">
        <div className="bg-green-50 rounded-lg p-4 flex items-center mb-6">
          <div className="bg-green-500 rounded-full p-2 mr-3">
            <Check className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-green-800">Appointment Confirmed</h2>
            <p className="text-green-700 text-sm">Please proceed to payment</p>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={doctor.avatar} alt={doctor.name} />
                <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="ml-3">
                <h2 className="font-semibold">{doctor.name}</h2>
                <p className="text-gray-500">{doctor.specialization}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex">
                <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="text-gray-700">{formatDate(date)}</p>
                  <p className="font-semibold">{time}</p>
                </div>
              </div>
              
              <div className="flex">
                {type === 'online' ? (
                  <Video className="h-5 w-5 text-gray-500 mr-3" />
                ) : (
                  <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                )}
                
                <div>
                  <p className="text-gray-700">
                    {type === 'online' ? 'Video Consultation' : 'In-person Visit'}
                  </p>
                  <p className="text-gray-500">
                    {type === 'online' 
                      ? 'You will receive a link before the appointment' 
                      : doctor.address}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {reason && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Reason for Visit</h3>
              <p className="text-gray-600">{reason}</p>
            </CardContent>
          </Card>
        )}
        
        <Card className="mb-8">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Fee</span>
                <span>$120.00</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span>$5.00</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>$125.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          className="w-full py-6"
          onClick={handleProceedToPayment}
        >
          Proceed to Payment
        </Button>
      </div>
    </AppLayout>
  );
}
