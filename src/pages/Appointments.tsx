import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Video, MapPin } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { getUserAppointments, getDoctorById } from "@/data/mockData";
import { Appointment } from "@/types";

export default function Appointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const allAppointments = getUserAppointments(user?.id || "");
  
  // Filter appointments based on active tab
  const appointments = allAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    
    if (activeTab === "upcoming") {
      return aptDate >= today && apt.status !== "cancelled";
    } else if (activeTab === "completed") {
      return apt.status === "completed";
    } else if (activeTab === "cancelled") {
      return apt.status === "cancelled";
    }
    
    return true;
  });
  
  // Sort appointments by date
  appointments.sort((a, b) => {
    if (activeTab === "upcoming") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });
  
  // Format date for display
  const formatAppointmentDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      
      // Check if appointment is today
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        return "Today";
      }
      
      // Check if appointment is tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (
        date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear()
      ) {
        return "Tomorrow";
      }
      
      // Otherwise return formatted date
      return format(date, "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };
  
  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <AppLayout title="My Appointments" showBack={false}>
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 py-2 border-b">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="upcoming" className="p-4">
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map(apt => {
                const doctor = getDoctorById(apt.doctorId);
                if (!doctor) return null;
                
                return (
                  <div key={apt.id} className="border rounded-lg overflow-hidden bg-white">
                    <div className="p-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={doctor.avatar} alt={doctor.name} />
                          <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="ml-3">
                          <h3 className="font-medium">{doctor.name}</h3>
                          <p className="text-sm text-gray-500">{doctor.specialization}</p>
                        </div>
                        
                        <div className="ml-auto">
                          {getStatusBadge(apt.status)}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{formatAppointmentDate(apt.date)}, {apt.time}</span>
                        </div>
                        
                        <div className="flex items-center">
                          {apt.type === 'online' ? (
                            <Video className="h-4 w-4 text-gray-500 mr-1" />
                          ) : (
                            <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                          )}
                          <span className="text-gray-700">
                            {apt.type === 'online' ? 'Online' : 'In-person'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-3">
                        {apt.status === "confirmed" && apt.type === "online" && (
                          <Button
                            variant="default"
                            className="flex-1"
                            onClick={() => navigate(`/chat/${doctor.id}`)}
                          >
                            Join Call
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/chat/${doctor.id}`)}
                        >
                          Message
                        </Button>
                        
                        {apt.status === "pending" && apt.paymentStatus === "pending" && (
                          <Button
                            variant="default"
                            className="flex-1"
                            onClick={() => navigate(`/payment-checkout/${apt.id}`)}
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You don't have any upcoming appointments</p>
              <Button onClick={() => navigate("/doctors")}>
                Find a Doctor
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="p-4">
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map(apt => {
                const doctor = getDoctorById(apt.doctorId);
                if (!doctor) return null;
                
                return (
                  <div key={apt.id} className="border rounded-lg overflow-hidden bg-white">
                    <div className="p-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={doctor.avatar} alt={doctor.name} />
                          <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="ml-3">
                          <h3 className="font-medium">{doctor.name}</h3>
                          <p className="text-sm text-gray-500">{doctor.specialization}</p>
                        </div>
                        
                        <div className="ml-auto">
                          {getStatusBadge(apt.status)}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{formatAppointmentDate(apt.date)}, {apt.time}</span>
                        </div>
                        
                        <div className="flex items-center">
                          {apt.type === 'online' ? (
                            <Video className="h-4 w-4 text-gray-500 mr-1" />
                          ) : (
                            <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                          )}
                          <span className="text-gray-700">
                            {apt.type === 'online' ? 'Online' : 'In-person'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/doctors/${doctor.id}`)}
                        >
                          Book Again
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">You don't have any completed appointments</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="p-4">
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map(apt => {
                const doctor = getDoctorById(apt.doctorId);
                if (!doctor) return null;
                
                return (
                  <div key={apt.id} className="border rounded-lg overflow-hidden bg-white">
                    <div className="p-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={doctor.avatar} alt={doctor.name} />
                          <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="ml-3">
                          <h3 className="font-medium">{doctor.name}</h3>
                          <p className="text-sm text-gray-500">{doctor.specialization}</p>
                        </div>
                        
                        <div className="ml-auto">
                          {getStatusBadge(apt.status)}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{formatAppointmentDate(apt.date)}, {apt.time}</span>
                        </div>
                        
                        <div className="flex items-center">
                          {apt.type === 'online' ? (
                            <Video className="h-4 w-4 text-gray-500 mr-1" />
                          ) : (
                            <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                          )}
                          <span className="text-gray-700">
                            {apt.type === 'online' ? 'Online' : 'In-person'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/doctors/${doctor.id}`)}
                        >
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">You don't have any cancelled appointments</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
