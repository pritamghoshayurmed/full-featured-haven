
import { Calendar, Home, Mail, Settings, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function BottomNav() {
  const location = useLocation();
  
  // Check if the path starts with the given route
  const isActive = (route: string) => {
    return location.pathname === route || 
      (route !== "/dashboard" && location.pathname.startsWith(route));
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-between z-50">
      <Link 
        to="/dashboard" 
        className={`flex flex-col items-center ${isActive("/dashboard") ? "text-primary" : "text-gray-500"}`}
      >
        <Home size={22} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link 
        to="/appointments" 
        className={`flex flex-col items-center ${isActive("/appointments") ? "text-primary" : "text-gray-500"}`}
      >
        <Calendar size={22} />
        <span className="text-xs mt-1">Schedule</span>
      </Link>
      
      <Link 
        to="/chat" 
        className={`flex flex-col items-center ${isActive("/chat") ? "text-primary" : "text-gray-500"}`}
      >
        <Mail size={22} />
        <span className="text-xs mt-1">Chat</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`flex flex-col items-center ${isActive("/profile") ? "text-primary" : "text-gray-500"}`}
      >
        <User size={22} />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </div>
  );
}
