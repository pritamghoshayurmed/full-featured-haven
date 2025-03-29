
import { useState } from "react";
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
import { getDoctorById, getTimeSlotsByDoctorAndDate } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";

export default function BookAppointment() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const doctor = getDoctorById(doctorId || "");
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<"online" | "in-person">("online");
  const [reason, setReason] = useState("");
  
  // Get available time slots for the selected date
  const timeSlots = date 
    ? getTimeSlotsByDoctorAndDate(
        doctorId || "", 
        format(date, 'yyyy-MM-dd')
      ) 
    : [];
  
  // Handler for booking appointment
  const handleBookAppointment = () => {
    if (!date || !selectedTime) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a date and time for your appointment",
      });
      return;
    }
    
    // In a real app, this would call an API to create the appointment
    // For this demo, we'll just navigate to the confirmation page
    navigate("/appointment-confirmation", {
      state: {
        doctorId,
        date: format(date, 'yyyy-MM-dd'),
        time: selectedTime,
        type: appointmentType,
        reason,
      }
    });
  };
  
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
            <AvatarImage src={doctor.avatar} alt={doctor.name} />
            <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="ml-3">
            <h2 className="font-semibold">{doctor.name}</h2>
            <p className="text-gray-500">{doctor.specialization}</p>
            <p className="text-sm text-gray-500">{doctor.experience} experience</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Appointment type selection */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Appointment Type</h3>
          <RadioGroup 
            value={appointmentType} 
            onValueChange={(value) => setAppointmentType(value as "online" | "in-person")}
            className="flex space-x-3"
          >
            <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1">
              <RadioGroupItem value="online" id="online" />
              <Label htmlFor="online" className="cursor-pointer">Online</Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1">
              <RadioGroupItem value="in-person" id="in-person" />
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
                      selectedTime === slot.time ? 'bg-primary text-white' : 'border'}
                    `}
                    onClick={() => setSelectedTime(slot.time)}
                  >
                    {slot.time}
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
