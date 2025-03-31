import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Calendar, Clock, FileText, DollarSign, Users, Activity, Brain, BarChart } from "lucide-react";
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
  const [earnings, setEarnings] = useState({
    total: 0,
    monthly: 0,
    weekly: 0
  });
  
  useEffect(() => {
    // Redirect if not a doctor
    if (user?.role !== "doctor") {
      navigate("/dashboard");
    }
    
    // Fetch doctor's appointments
    const allAppointments = getUserAppointments(user?.id || "");
    setAppointments(allAppointments);
    
    // Get all patients
    const allUsers = getAllUsers().filter(u => u.role === "patient");
    setPatients(allUsers);

    // Calculate earnings (mock data)
    setEarnings({
      total: 25000,
      monthly: 5000,
      weekly: 1200
    });
  }, [user]);
  
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status !== 'cancelled'
  );
  
  const pastAppointments = appointments.filter(apt => 
    new Date(apt.date) < new Date() || apt.status === 'completed'
  );

  const todayAppointments = upcomingAppointments.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.date);
    return aptDate.toDateString() === today.toDateString();
  });
  
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
  
  const getPatientDetails = (patientId: string) => {
    return patients.find(patient => patient.id === patientId) || null;
  };
  
  return (
    <AppLayout title="Doctor Dashboard" showBack={false}>
      <div className="p-4 bg-gray-900">
        {/* Doctor stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">${earnings.total}</CardTitle>
              <CardDescription className="text-gray-400">Total Earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Monthly: ${earnings.monthly}</span>
                <span>Weekly: ${earnings.weekly}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">{todayAppointments.length}</CardTitle>
              <CardDescription className="text-gray-400">Today's Appointments</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">{patients.length}</CardTitle>
              <CardDescription className="text-gray-400">Total Patients</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">{upcomingAppointments.length}</CardTitle>
              <CardDescription className="text-gray-400">Upcoming Appointments</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button 
            onClick={() => navigate("/doctor/ai-assistant")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Brain className="mr-2 h-4 w-4" /> AI Assistant
          </Button>
          <Button 
            onClick={() => navigate("/doctor/analytics")}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <BarChart className="mr-2 h-4 w-4" /> Analytics
          </Button>
          <Button 
            onClick={() => navigate("/doctor/patients")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Users className="mr-2 h-4 w-4" /> Patient Records
          </Button>
        </div>
        
        {/* Appointments tabs */}
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-600">Upcoming</TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-blue-600">Past Appointments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(appointment => {
                const patient = getPatientDetails(appointment.patientId);
                
                return (
                  <Card key={appointment.id} className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={patient?.avatar} alt={patient?.name} />
                            <AvatarFallback>{patient?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-white">{patient?.name}</CardTitle>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{appointment.date}</span>
                              <Clock className="w-4 h-4 ml-3 mr-1" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={
                          appointment.status === 'confirmed' ? 'bg-green-900 text-green-300' : 
                          appointment.status === 'cancelled' ? 'bg-red-900 text-red-300' : 
                          'bg-yellow-900 text-yellow-300'
                        }>
                          {appointment.status === 'confirmed' ? 'Confirmed' : 
                           appointment.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <p className="text-gray-400">{appointment.reason || 'No reason provided'}</p>
                      <Badge className="mt-2 bg-blue-900 text-blue-300">{appointment.type}</Badge>
                    </CardContent>
                    
                    <CardFooter>
                      <div className="flex space-x-2 w-full">
                        {appointment.status === 'pending' && (
                          <>
                            <Button 
                              onClick={() => handleAcceptAppointment(appointment.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700" 
                            >
                              <Check className="mr-2 h-4 w-4" /> Accept
                            </Button>
                            <Button 
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700" 
                            >
                              <X className="mr-2 h-4 w-4" /> Decline
                            </Button>
                          </>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <>
                            <Button 
                              onClick={() => handleCompleteAppointment(appointment.id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                              <Check className="mr-2 h-4 w-4" /> Mark as Complete
                            </Button>
                            <Button 
                              onClick={() => navigate(`/chat/${patient?.id}`)}
                              className="flex-1 bg-gray-700 hover:bg-gray-600" 
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
              <div className="text-center py-8 text-gray-400">
                <p>No upcoming appointments</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-4 space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map(appointment => {
                const patient = getPatientDetails(appointment.patientId);
                
                return (
                  <Card key={appointment.id} className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={patient?.avatar} alt={patient?.name} />
                            <AvatarFallback>{patient?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-white">{patient?.name}</CardTitle>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{appointment.date}</span>
                              <Clock className="w-4 h-4 ml-3 mr-1" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={
                          appointment.status === 'completed' ? 'bg-green-900 text-green-300' : 
                          'bg-red-900 text-red-300'
                        }>
                          {appointment.status === 'completed' ? 'Completed' : 'Cancelled'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-gray-400">{appointment.reason || 'No reason provided'}</p>
                    </CardContent>
                    
                    <CardFooter>
                      <div className="flex space-x-2 w-full">
                        <Button 
                          onClick={() => navigate(`/chat/${patient?.id}`)}
                          className="flex-1 bg-gray-700 hover:bg-gray-600"
                        >
                          Message Patient
                        </Button>
                        <Button 
                          onClick={() => navigate(`/doctor/patient-records/${patient?.id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <FileText className="mr-2 h-4 w-4" /> View Records
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No past appointments</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
