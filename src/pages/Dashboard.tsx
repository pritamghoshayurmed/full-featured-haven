
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Star, Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { DoctorCard } from "@/components/DoctorCard";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  getAllDoctors, 
  specializations, 
  getUserAppointments 
} from "@/data/mockData";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Redirect to appropriate dashboard based on role
  useEffect(() => {
    if (user?.role === "doctor") {
      navigate("/doctor/dashboard");
    } else if (user?.role === "admin") {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);
  
  const doctors = getAllDoctors();
  const upcomingAppointments = getUserAppointments(user?.id || "").filter(apt => 
    new Date(apt.date) >= new Date() && apt.status !== 'cancelled'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Get next appointment
  const nextAppointment = upcomingAppointments[0];
  
  // Get doctor for next appointment
  const nextAppointmentDoctor = nextAppointment 
    ? doctors.find(doc => doc.id === nextAppointment.doctorId) 
    : null;
  
  // Format date for display
  const formatAppointmentDate = (dateString: string) => {
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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };
  
  return (
    <AppLayout title="Home" showBack={false}>
      <div className="p-4">
        {/* User greeting */}
        <div className="flex items-center mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-gray-500">Good Morning, 👋</p>
            <h2 className="font-semibold text-lg">{user?.name}</h2>
          </div>
        </div>
        
        {/* AI Health Assistant card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                <Bot size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">KABIRAJ AI Health Assistant</h3>
                <p className="text-sm text-white/80">Describe your symptoms for a quick assessment</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/ai-assistant")}
              className="mt-3 w-full bg-white text-blue-600 hover:bg-white/90"
            >
              Talk to KABIRAJ AI
            </Button>
          </CardContent>
        </Card>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search doctors, specialties..."
            className="pl-10 py-6"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Next appointment */}
        {nextAppointment && nextAppointmentDoctor && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Upcoming Appointment</h3>
              <Link to="/appointments" className="text-primary text-sm">
                View All
              </Link>
            </div>
            
            <div className="border rounded-lg overflow-hidden bg-white p-4">
              <div className="flex items-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={nextAppointmentDoctor.avatar} alt={nextAppointmentDoctor.name} />
                  <AvatarFallback>{nextAppointmentDoctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="ml-4">
                  <h3 className="font-medium">{nextAppointmentDoctor.name}</h3>
                  <p className="text-sm text-gray-500">{nextAppointmentDoctor.specialization}</p>
                  
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm">{nextAppointmentDoctor.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{formatAppointmentDate(nextAppointment.date)}</p>
                  <p className="font-semibold text-gray-800">{nextAppointment.time}</p>
                </div>
                
                <Badge className={`
                  ${nextAppointment.type === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                `}>
                  {nextAppointment.type === 'online' ? 'Online' : 'In-person'}
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        {/* Specializations */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Specializations</h3>
          <div className="grid grid-cols-4 gap-3">
            {specializations.slice(0, 8).map((spec) => (
              <button
                key={spec.id}
                onClick={() => navigate(`/doctors?spec=${spec.name}`)}
                className="flex flex-col items-center p-3 bg-white rounded-lg border hover:border-primary transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <span className="text-blue-600 text-lg">
                    {spec.icon === 'heart' && '❤️'}
                    {spec.icon === 'brain' && '🧠'}
                    {spec.icon === 'bone' && '🦴'}
                    {spec.icon === 'stethoscope' && '👨‍⚕️'}
                    {spec.icon === 'eye' && '👁️'}
                    {spec.icon === 'tooth' && '🦷'}
                    {spec.icon === 'baby' && '👶'}
                    {spec.icon === 'shield' && '🛡️'}
                  </span>
                </div>
                <span className="text-xs text-center">{spec.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Top Doctors */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Top Doctors</h3>
            <Link to="/doctors" className="text-primary text-sm">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {doctors.slice(0, 3).map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
          
          <Button 
            onClick={() => navigate("/doctors")} 
            variant="outline" 
            className="w-full mt-4"
          >
            View More Doctors
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
