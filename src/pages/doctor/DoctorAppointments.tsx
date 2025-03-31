import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Phone, Mail, MapPin, FileText, Check, X, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserAppointments, getAllUsers, getPatientHealthProfile } from "@/data/mockData";
import { Appointment, User as UserType, PatientHealth } from "@/types";
import { format, isToday, isPast, isFuture, parseISO } from "date-fns";

export default function DoctorAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Record<string, UserType>>({});
  const [patientHealth, setPatientHealth] = useState<Record<string, PatientHealth | null>>({});
  
  useEffect(() => {
    // Redirect if not a doctor
    if (user?.role !== "doctor") {
      navigate("/dashboard");
      return;
    }
    
    // Fetch doctor's appointments - we're using the doctor's ID to filter
    const doctorId = user?.id || "";
    // For real app: need to fetch appointments where doctorId matches the current user
    const allAppointments = getUserAppointments(doctorId) || [];
    setAppointments(allAppointments);
    
    // Get all patients
    const allUsers = getAllUsers();
    const patientMap: Record<string, UserType> = {};
    const healthMap: Record<string, PatientHealth | null> = {};
    
    // Create a mapping of patient IDs to patient data for quick lookup
    allAppointments.forEach(appointment => {
      const patientId = appointment.patientId;
      
      if (!patientMap[patientId]) {
        const patientData = allUsers.find(u => u.id === patientId);
        if (patientData) {
          patientMap[patientId] = patientData;
          
          // Also fetch patient health profile
          const healthProfile = getPatientHealthProfile(patientId);
          healthMap[patientId] = healthProfile || null;
        }
      }
    });
    
    setPatients(patientMap);
    setPatientHealth(healthMap);
  }, [user, navigate]);
  
  const todayAppointments = appointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    return isToday(aptDate) && apt.status !== 'cancelled';
  });
  
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    return isFuture(aptDate) && apt.status !== 'cancelled' && !isToday(aptDate);
  });
  
  const pastAppointments = appointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    return (isPast(aptDate) && !isToday(aptDate)) || apt.status === 'completed';
  });
  
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  
  const handleAcceptAppointment = (appointmentId: string) => {
    setAppointments(apps => 
      apps.map(app => 
        app.id === appointmentId ? { ...app, status: 'confirmed' } : app
      )
    );
  };
  
  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments(apps => 
      apps.map(app => 
        app.id === appointmentId ? { ...app, status: 'cancelled' } : app
      )
    );
  };
  
  const handleCompleteAppointment = (appointmentId: string) => {
    setAppointments(apps => 
      apps.map(app => 
        app.id === appointmentId ? { ...app, status: 'completed' } : app
      )
    );
  };
  
  const renderAppointmentCard = (appointment: Appointment) => {
    const patient = patients[appointment.patientId];
    const healthProfile = patientHealth[appointment.patientId];
    
    if (!patient) return null;
    
    return (
      <Card key={appointment.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={patient?.avatar} alt={patient?.name} />
                <AvatarFallback>{patient?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{patient?.name}</CardTitle>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{appointment.date}</span>
                  <Clock className="w-4 h-4 ml-3 mr-1" />
                  <span>{appointment.time}</span>
                </div>
              </div>
            </div>
            <Badge className={
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            }>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          <div className="space-y-3">
            <div className="flex items-start text-sm">
              <Phone className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
              <span>{patient.phone}</span>
            </div>
            
            <div className="flex items-start text-sm">
              <Mail className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
              <span>{patient.email}</span>
            </div>
            
            {patient.address && (
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                <span>{patient.address}</span>
              </div>
            )}
            
            {appointment.reason && (
              <div className="flex items-start text-sm">
                <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                <span>Reason: {appointment.reason}</span>
              </div>
            )}
            
            {healthProfile && (
              <div className="mt-3 pt-3 border-t">
                <h4 className="text-sm font-medium mb-2">Health Information</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {healthProfile.healthMetrics.bloodPressure && (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">BP:</span>
                      <span>{healthProfile.healthMetrics.bloodPressure}</span>
                    </div>
                  )}
                  
                  {healthProfile.healthMetrics.heartRate && (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">Pulse:</span>
                      <span>{healthProfile.healthMetrics.heartRate} bpm</span>
                    </div>
                  )}
                  
                  {healthProfile.allergies.length > 0 && (
                    <div className="col-span-2 flex items-start">
                      <span className="text-gray-500 mr-1">Allergies:</span>
                      <span>{healthProfile.allergies.join(", ")}</span>
                    </div>
                  )}
                  
                  {healthProfile.chronicConditions.length > 0 && (
                    <div className="col-span-2 flex items-start">
                      <span className="text-gray-500 mr-1">Conditions:</span>
                      <span>{healthProfile.chronicConditions.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          <div className="flex space-x-2 w-full">
            {appointment.status === 'pending' && (
              <>
                <Button 
                  onClick={() => handleAcceptAppointment(appointment.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                >
                  <Check className="mr-2 h-4 w-4" /> Accept
                </Button>
                <Button 
                  onClick={() => handleCancelAppointment(appointment.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                >
                  <X className="mr-2 h-4 w-4" /> Decline
                </Button>
              </>
            )}
            
            {appointment.status === 'confirmed' && (
              <>
                <Button 
                  onClick={() => handleCompleteAppointment(appointment.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Check className="mr-2 h-4 w-4" /> Mark as Complete
                </Button>
                <Button 
                  onClick={() => navigate(`/chat/${patient?.id}`)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800" 
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Message Patient
                </Button>
              </>
            )}
            
            {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
              <Button 
                onClick={() => navigate(`/chat/${patient?.id}`)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800" 
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Message Patient
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <AppLayout title="My Appointments" showBack={false}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-1">My Schedule</h1>
        <p className="text-gray-500 mb-4">Manage your appointments with patients</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{todayAppointments.length}</CardTitle>
              <CardDescription>Today's Appointments</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{pendingAppointments.length}</CardTitle>
              <CardDescription>Pending Requests</CardDescription>
            </CardHeader>
          </Card>
        </div>
        
        <Tabs defaultValue="today" className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="mt-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map(appointment => renderAppointmentCard(appointment))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="mb-1">No appointments scheduled for today</p>
                <p className="text-sm">Your schedule is clear for now</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(appointment => renderAppointmentCard(appointment))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="mb-1">No upcoming appointments</p>
                <p className="text-sm">Your future schedule is clear</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-4">
            {pendingAppointments.length > 0 ? (
              pendingAppointments.map(appointment => renderAppointmentCard(appointment))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="mb-1">No pending appointment requests</p>
                <p className="text-sm">You're all caught up</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map(appointment => renderAppointmentCard(appointment))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="mb-1">No past appointments</p>
                <p className="text-sm">Your appointment history will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
} 