import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import doctorService from "@/services/doctor.service";
import { appointmentService } from "@/services/appointment.service";
import { useAuth } from "@/hooks/useAuth";
import { AppointmentType } from "@/types";

export default function BookAppointment() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("ONLINE");
  const [reason, setReason] = useState("");
  
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
          description: "Failed to load doctor details. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctorDetails();
  }, [doctorId, toast]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!doctorId || !date) return;
      
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const slots = await doctorService.getDoctorTimeSlots(doctorId, formattedDate);
        setTimeSlots(slots);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load available time slots. Please try again later.",
        });
      }
    };
    
    fetchTimeSlots();
  }, [doctorId, date, toast]);
  
  // Handler for booking appointment
  const handleBookAppointment = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to book an appointment",
      });
      navigate("/login", { state: { from: `/book-appointment/${doctorId}` } });
      return;
    }
    
    if (!date || !selectedTime) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a date and time for your appointment",
      });
      return;
    }
    
    try {
      // Create appointment data
      const appointmentData = {
        doctorId,
        date: format(date, 'yyyy-MM-dd'),
        startTime: selectedTime,
        endTime: endTime || calculateEndTime(selectedTime),
        type: appointmentType,
        reasonForVisit: reason,
        symptoms: []
      };
      
      // Create appointment
      const appointment = await appointmentService.createAppointment(appointmentData);
      
      // Navigate to appointment confirmation page
      navigate("/appointment-confirmation", {
        state: {
          appointmentId: appointment.id,
          doctorId,
          date: format(date, 'yyyy-MM-dd'),
          time: selectedTime,
          type: appointmentType,
          reason,
        }
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: "Could not book appointment. Please try again later.",
      });
    }
  };
  
  // Helper to calculate end time (30 min default appointment)
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours;
    let endMinutes = minutes + 30;
    
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };
  
  const handleTimeSlotSelect = (slot: any) => {
    setSelectedTime(slot.startTime);
    setEndTime(slot.endTime);
  };
  
  if (isLoading) {
    return (
      <AppLayout title="Book Appointment">
        <div className="p-4 text-center">
          <p>Loading doctor information...</p>
        </div>
      </AppLayout>
    );
  }
  
  if (!doctor) {
    return (
      <AppLayout title="Book Appointment">
        <div className="p-4 text-center">
          <p>Doctor not found</p>
          <Button 
            onClick={() => navigate("/doctors")} 
            className="mt-4"
          >
            Back to Doctors
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout title="Book Appointment">
      {/* Doctor info */}
      <div className="bg-white p-4 border-b">
        <div className="flex items-center">
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
            <p className="text-sm text-gray-500">{doctor.experience} years experience</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Appointment type selection */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Appointment Type</h3>
          <RadioGroup 
            value={appointmentType} 
            onValueChange={(value) => setAppointmentType(value as AppointmentType)}
            className="flex space-x-3"
          >
            <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1">
              <RadioGroupItem value="ONLINE" id="online" />
              <Label htmlFor="online" className="cursor-pointer">Online</Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1">
              <RadioGroupItem value="IN_PERSON" id="in-person" />
              <Label htmlFor="in-person" className="cursor-pointer">In-person</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Calendar for date selection */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Select Date</h3>
          <div className="border rounded-lg overflow-hidden">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-sm p-0"
              disabled={{ before: new Date() }}
            />
          </div>
        </div>
        
        {/* Time slots */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Available Time Slots</h3>
          
          {date ? (
            timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map(slot => (
                  <button
                    key={slot.id}
                    disabled={!slot.isAvailable}
                    className={`
                      py-3 px-2 rounded-lg text-center
                      ${!slot.isAvailable ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                      selectedTime === slot.startTime ? 'bg-primary text-white' : 'border'}
                    `}
                    onClick={() => handleTimeSlotSelect(slot)}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No slots available for the selected date
              </p>
            )
          ) : (
            <p className="text-center text-gray-500 py-4">
              Please select a date to see available slots
            </p>
          )}
        </div>
        
        {/* Visit reason */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3">Reason for Visit</h3>
          <Textarea
            placeholder="Briefly describe your symptoms or reason for appointment"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        {/* Book button */}
        <Button 
          className="w-full py-6"
          disabled={!date || !selectedTime}
          onClick={handleBookAppointment}
        >
          Continue to Payment
        </Button>
      </div>
    </AppLayout>
  );
}
