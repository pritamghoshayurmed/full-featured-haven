
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DoctorCardProps {
  doctor: User;
  compact?: boolean;
}

export function DoctorCard({ doctor, compact = false }: DoctorCardProps) {
  const { id, name, specialization, rating, reviews, avatar, experience } = doctor;
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (compact) {
    return (
      <Link to={`/doctors/${id}`} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{specialization}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/doctors/${id}`}
      className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{specialization}</p>
            
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="ml-1 text-sm font-medium">{rating}</span>
              </div>
              <span className="mx-1 text-gray-300">•</span>
              <span className="text-sm text-gray-500">{reviews} reviews</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {experience}
          </Badge>
          <span className="text-primary font-medium">View Profile</span>
        </div>
      </div>
    </Link>
  );
}
