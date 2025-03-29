
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { DoctorCard } from "@/components/DoctorCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  getAllDoctors,
  specializations
} from "@/data/mockData";
import { User } from "@/types";

export default function DoctorList() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const specParam = queryParams.get('spec');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState<string | null>(specParam);
  const [filteredDoctors, setFilteredDoctors] = useState<User[]>([]);
  
  const allDoctors = getAllDoctors();
  
  // Filter doctors based on search query and selected specialization
  useEffect(() => {
    let filtered = allDoctors;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query) || 
        (doc.specialization && doc.specialization.toLowerCase().includes(query))
      );
    }
    
    // Filter by specialization
    if (selectedSpec) {
      filtered = filtered.filter(doc => doc.specialization === selectedSpec);
    }
    
    setFilteredDoctors(filtered);
  }, [searchQuery, selectedSpec, allDoctors]);
  
  return (
    <AppLayout title="Find Doctors">
      <div className="p-4">
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
        
        {/* Specialization filters */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <Badge
              variant={selectedSpec === null ? "default" : "outline"}
              className="py-2 px-4 cursor-pointer"
              onClick={() => setSelectedSpec(null)}
            >
              All
            </Badge>
            
            {specializations.map((spec) => (
              <Badge
                key={spec.id}
                variant={selectedSpec === spec.name ? "default" : "outline"}
                className="py-2 px-4 cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedSpec(spec.name)}
              >
                {spec.name}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Doctor list */}
        <div className="space-y-4">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No doctors found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
