import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Check, MapPin, Video } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import doctorService from "@/services/doctor.service";
import { appointmentService } from "@/services/appointment.service";
import { formatCurrency } from "@/lib/utils";

export default function AppointmentConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get data from state
  const { 
    appointmentId,
    doctorId, 
    date, 
    time, 
    type, 
    reason 
  } = location.state || {};
  
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (!doctorId) return;
      
      try {
        setIsLoading(true);
        const doctorData = await doctorService.getDoctorById(doctorId);
        setDoctor(doctorData);
      } catch (err: any) {
        console.error('Error fetching doctor details:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load doctor details.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctorDetails();
  }, [doctorId, toast]);
  
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
  if (isLoading) {
    return (
      <AppLayout title="Confirmation">
        <div className="p-4 text-center">
          <p>Loading appointment details...</p>
        </div>
      </AppLayout>
    );
  }
  
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
    navigate(`/payment-checkout/${appointmentId}`);
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
                <AvatarImage 
                  src={doctor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`} 
                  alt={doctor.name} 
                />
                <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="ml-3">
                <h2 className="font-semibold">{doctor.name}</h2>
                <p className="text-gray-500">{doctor.specialization}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {formatDate(date)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {time}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                {type === "ONLINE" ? (
                  <Video className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {type === "ONLINE" ? "Online Consultation" : "In-person Visit"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {type === "ONLINE" 
                      ? "Video call link will be sent before appointment" 
                      : (typeof doctor.address === 'object' 
                         ? `${doctor.address.street}, ${doctor.address.city}` 
                         : doctor.location || "Address details will be sent")}
                  </p>
                </div>
              </div>
              
              {reason && (
                <div>
                  <p className="font-medium mb-1">Reason for Visit</p>
                  <p className="text-sm text-gray-600">{reason}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Fee</span>
                <span>{formatCurrency(doctor.consultationFee || doctor.fee || 0)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span>{formatCurrency(50)}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>{formatCurrency((doctor.consultationFee || doctor.fee || 0) + 50)}</span>
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
