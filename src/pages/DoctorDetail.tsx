import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, MessageSquare, Phone, Star, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import doctorService from "@/services/doctor.service";
import { formatCurrency } from "@/lib/utils";

interface DoctorReview {
  id: string;
  rating: number;
  comment: string;
  patientName: string;
  date: string;
}

export default function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState<any>(null);
  const [doctorReviews, setDoctorReviews] = useState<DoctorReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const doctorData = await doctorService.getDoctorById(id);
        setDoctor(doctorData);
        
        // Fetch reviews for this doctor
        const reviewsData = await doctorService.getDoctorReviews(id);
        setDoctorReviews(reviewsData || []);
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching doctor details:', err);
        setError('Failed to load doctor details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctorDetails();
  }, [id]);
  
  if (isLoading) {
    return (
      <AppLayout title="Doctor Details">
        <div className="p-4 h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-gray-600">Loading doctor details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (error || !doctor) {
    return (
      <AppLayout title="Doctor Details">
        <div className="p-4 text-center">
          <p>{error || 'Doctor not found'}</p>
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
    <AppLayout title="Doctor Details">
      {/* Doctor profile header */}
      <div className="bg-white p-4 border-b">
        <div className="flex items-center">
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={doctor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`} 
              alt={doctor.name} 
            />
            <AvatarFallback>{doctor.name?.charAt(0) || 'D'}</AvatarFallback>
          </Avatar>
          
          <div className="ml-4">
            <h1 className="text-xl font-semibold">{doctor.name}</h1>
            <p className="text-gray-500">{doctor.specialization}</p>
            
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="ml-1 text-sm font-medium">{doctor.rating || '4.5'}</span>
              </div>
              <span className="mx-1 text-gray-300">•</span>
              <span className="text-sm text-gray-500">{doctor.reviews || doctorReviews.length} reviews</span>
            </div>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="flex mt-4 space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/chat/${doctor.id}`)}
          >
            <MessageSquare size={18} className="mr-1" />
            Chat
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(`tel:${doctor.phoneNumber || '+911234567890'}`)}
          >
            <Phone size={18} className="mr-1" />
            Call
          </Button>
          
          <Button
            className="flex-1"
            size="sm"
            onClick={() => navigate(`/book-appointment/${doctor.id}`)}
          >
            <Calendar size={18} className="mr-1" />
            Book
          </Button>
        </div>
      </div>
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        {/* About tab */}
        <TabsContent value="about" className="p-4">
          <h3 className="font-semibold mb-2">About Doctor</h3>
          <p className="text-gray-600 mb-6">{doctor.bio || `Dr. ${doctor.name} is a highly skilled ${doctor.specialization} with ${doctor.experience || '10'} years of experience in the field.`}</p>
          
          <h3 className="font-semibold mb-2">Location</h3>
          <div className="flex items-start text-gray-600 mb-2">
            <MapPin size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <p>
              {typeof doctor.address === 'object' ? 
                `${doctor.address.street}, ${doctor.address.city}, ${doctor.address.state}, ${doctor.address.zipCode}, ${doctor.address.country}` : 
                (doctor.address || doctor.location || 'Available for teleconsultation')}
            </p>
          </div>
          
          <div className="mt-4 mb-6">
            <h3 className="font-semibold mb-2">Consultation Fee</h3>
            <p className="text-lg font-bold text-primary">{formatCurrency(doctor.consultationFee || doctor.fee || 1500)}</p>
          </div>
          
          <h3 className="font-semibold mb-2 mt-4">Availability</h3>
          <div className="flex items-center text-gray-600 mb-1">
            <Clock size={18} className="mr-2" />
            <p>
              {Array.isArray(doctor.availability) 
                ? doctor.availability.map((slot: any, index: number) => (
                    <span key={index} className="block">
                      {slot.day}: {slot.startTime} - {slot.endTime}
                    </span>
                  ))
                : (typeof doctor.availability === 'string' 
                    ? doctor.availability 
                    : 'Monday - Friday: 9:00 AM - 5:00 PM')}
            </p>
          </div>
          {doctor.availability2 && (
            <div className="flex items-center text-gray-600">
              <Clock size={18} className="mr-2" />
              <p>{typeof doctor.availability2 === 'string' ? doctor.availability2 : ''}</p>
            </div>
          )}
        </TabsContent>
        
        {/* Experience tab */}
        <TabsContent value="experience" className="p-4">
          <h3 className="font-semibold mb-3">Experience</h3>
          {doctor.workExperience ? (
            <div className="border-l-2 border-primary pl-4 space-y-4">
              {doctor.workExperience.map((exp: any, index: number) => (
                <div key={index}>
                  <p className="text-gray-500 text-sm">{exp.period}</p>
                  <h4 className="font-medium">{exp.position}</h4>
                  <p className="text-gray-600">{exp.hospital}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-l-2 border-primary pl-4 space-y-4">
              <div>
                <p className="text-gray-500 text-sm">2018 - Present</p>
                <h4 className="font-medium">Senior {doctor.specialization}</h4>
                <p className="text-gray-600">City Medical Center</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">{2018 - (doctor.experience || 10)} - 2018</p>
                <h4 className="font-medium">Specialist</h4>
                <p className="text-gray-600">Regional Hospital</p>
              </div>
            </div>
          )}
          
          <h3 className="font-semibold mt-6 mb-3">Education</h3>
          {doctor.education ? (
            <div className="border-l-2 border-primary pl-4 space-y-4">
              {doctor.education.map((edu: any, index: number) => (
                <div key={index}>
                  <p className="text-gray-500 text-sm">{edu.period}</p>
                  <h4 className="font-medium">{edu.degree}</h4>
                  <p className="text-gray-600">{edu.institution}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-l-2 border-primary pl-4 space-y-4">
              <div>
                <p className="text-gray-500 text-sm">2004 - 2008</p>
                <h4 className="font-medium">Specialization in {doctor.specialization}</h4>
                <p className="text-gray-600">Medical University</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">1998 - 2004</p>
                <h4 className="font-medium">Doctor of Medicine</h4>
                <p className="text-gray-600">Medical University</p>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Reviews tab */}
        <TabsContent value="reviews" className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Patient Reviews</h3>
            <div className="flex items-center">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="ml-1 font-medium">{doctor.rating || '4.5'}</span>
              <span className="ml-1 text-gray-500">({doctor.reviews || doctorReviews.length})</span>
            </div>
          </div>
          
          {doctorReviews.length > 0 ? (
            <div className="space-y-4">
              {doctorReviews.map(review => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{review.patientName || 'Anonymous Patient'}</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">
                    {new Date(review.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Fixed booking button */}
      <div className="fixed bottom-20 left-4 right-4">
        <Button 
          className="w-full py-6"
          onClick={() => navigate(`/book-appointment/${doctor.id}`)}
        >
          Book Appointment
        </Button>
      </div>
    </AppLayout>
  );
}
