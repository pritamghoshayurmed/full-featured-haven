
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Calendar, Clock, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserAppointments, getAllUsers } from "@/data/mockData";
import { Appointment, User } from "@/types";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  
  useEffect(() => {
    // Redirect if not a doctor
    if (user?.role !== "doctor") {
      navigate("/dashboard");
    }
    
    // Fetch doctor's appointments
    // In a real app, this would filter server-side
    const allAppointments = getUserAppointments(user?.id || "");
    setAppointments(allAppointments);
    
    // Get all patients (simplified - in a real app this would come from API)
    const allUsers = getAllUsers().filter(u => u.role === "patient");
    setPatients(allUsers);
  }, [user]);
  
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status !== 'cancelled'
  );
  
  const pastAppointments = appointments.filter(apt => 
    new Date(apt.date) < new Date() || apt.status === 'completed'
  );
  
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
  
  // Find patient details for an appointment
  const getPatientDetails = (patientId: string) => {
    return patients.find(patient => patient.id === patientId) || null;
  };
  
  return (
    <AppLayout title="Doctor Dashboard" showBack={false}>
      <div className="p-4">
        {/* Doctor stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{upcomingAppointments.length}</CardTitle>
              <CardDescription>Upcoming</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{pastAppointments.length}</CardTitle>
              <CardDescription>Completed</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{patients.length}</CardTitle>
              <CardDescription>Patients</CardDescription>
            </CardHeader>
          </Card>
        </div>
        
        {/* Appointments tabs */}
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(appointment => {
                const patient = getPatientDetails(appointment.patientId);
                
                return (
                  <Card key={appointment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={patient?.avatar} alt={patient?.name} />
                            <AvatarFallback>{patient?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{patient?.name}</CardTitle>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{appointment.date}</span>
                              <Clock className="w-4 h-4 ml-3 mr-1" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {appointment.status === 'confirmed' ? 'Confirmed' : 
                           appointment.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <p className="text-gray-500">{appointment.reason || 'No reason provided'}</p>
                      <Badge className="mt-2">{appointment.type}</Badge>
                    </CardContent>
                    
                    <CardFooter>
                      <div className="flex space-x-2 w-full">
                        {appointment.status === 'pending' && (
                          <>
                            <Button 
                              onClick={() => handleAcceptAppointment(appointment.id)}
                              className="flex-1" 
                              variant="outline"
                            >
                              <Check className="mr-2 h-4 w-4" /> Accept
                            </Button>
                            <Button 
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="flex-1" 
                              variant="destructive"
                            >
                              <X className="mr-2 h-4 w-4" /> Decline
                            </Button>
                          </>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <>
                            <Button 
                              onClick={() => handleCompleteAppointment(appointment.id)}
                              className="flex-1"
                            >
                              <Check className="mr-2 h-4 w-4" /> Mark as Complete
                            </Button>
                            <Button 
                              onClick={() => navigate(`/chat/${patient?.id}`)}
                              className="flex-1" 
                              variant="outline"
                            >
                              Message Patient
                            </Button>
                          </>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p>No upcoming appointments</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-4 space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map(appointment => {
                const patient = getPatientDetails(appointment.patientId);
                
                return (
                  <Card key={appointment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={patient?.avatar} alt={patient?.name} />
                            <AvatarFallback>{patient?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{patient?.name}</CardTitle>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{appointment.date}</span>
                              <Clock className="w-4 h-4 ml-3 mr-1" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }>
                          {appointment.status === 'completed' ? 'Completed' : 'Cancelled'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-gray-500">{appointment.reason || 'No reason provided'}</p>
                    </CardContent>
                    
                    <CardFooter>
                      <div className="flex space-x-2 w-full">
                        <Button 
                          onClick={() => navigate(`/chat/${patient?.id}`)}
                          variant="outline"
                          className="flex-1"
                        >
                          Message Patient
                        </Button>
                        <Button 
                          onClick={() => console.log("View medical records")}
                          variant="outline"
                          className="flex-1"
                        >
                          <FileText className="mr-2 h-4 w-4" /> View Records
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p>No past appointments</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
