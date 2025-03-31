import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import doctorService from '@/services/doctor.service';

const DoctorsList: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const data = await doctorService.getAllDoctors();
        setDoctors(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);
  
  // Filter doctors based on search term and specialization
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = specialization === 'all' ? true : doctor.specialization === specialization;
    
    return matchesSearch && matchesSpecialization;
  });
  
  // Sort doctors based on the selected sort option
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case 'experience-high':
        return (b.experience || 0) - (a.experience || 0);
      case 'experience-low':
        return (a.experience || 0) - (b.experience || 0);
      case 'fee-high':
        return (b.fee || 0) - (a.fee || 0);
      case 'fee-low':
        return (a.fee || 0) - (b.fee || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });
  
  const specializations = Array.from(new Set(doctors.map(doctor => doctor.specialization)));

  if (loading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-3xl font-bold mb-6">Find Doctors</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Find Doctors</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Button 
            variant="link" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Find Doctors</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by doctor name, specialization, or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={specialization} onValueChange={setSpecialization}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            {specializations.map(spec => (
              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="experience-high">Experience (High to Low)</SelectItem>
            <SelectItem value="experience-low">Experience (Low to High)</SelectItem>
            <SelectItem value="fee-high">Fee (High to Low)</SelectItem>
            <SelectItem value="fee-low">Fee (Low to High)</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedDoctors.length > 0 ? (
          sortedDoctors.map(doctor => (
            <Card key={doctor.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 p-4">
                    <img
                      src={doctor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`}
                      alt={doctor.name}
                      className="rounded-full w-24 h-24 object-cover mx-auto"
                    />
                  </div>
                  
                  <div className="md:w-3/4 p-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        <h3 className="text-lg font-bold">{doctor.name}</h3>
                        <p className="text-muted-foreground">{doctor.specialization}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm">
                            {doctor.rating || 'N/A'} ({doctor.reviews || 0} reviews)
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {doctor.location || 'Location not specified'}
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className="mr-2">
                            {doctor.experience || 'N/A'} yrs exp
                          </Badge>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {doctor.availability || 'Contact for availability'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:text-right">
                        <p className="text-lg font-bold">{formatCurrency(doctor.fee || 0)}</p>
                        <p className="text-xs text-muted-foreground mb-3">Consultation Fee</p>
                        
                        <Link to={`/doctors/${doctor.id}`}>
                          <Button className="w-full md:w-auto">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-lg text-muted-foreground">No doctors found matching your criteria.</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm('');
                setSpecialization('all');
                setSortBy('recommended');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsList; 