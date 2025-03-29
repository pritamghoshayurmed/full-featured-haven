
import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getUserNotifications } from "@/data/mockData";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showNotifications?: boolean;
}

export function PageHeader({ title, showBack = true, showNotifications = true }: PageHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get unread notifications count
  const unreadCount = user ? 
    getUserNotifications(user.id).filter(n => !n.read).length : 
    0;
  
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="font-semibold text-lg">{title}</h1>
      </div>
      
      {showNotifications && (
        <button
          onClick={() => navigate("/notifications")}
          className="relative text-gray-500 hover:text-gray-700"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.2rem] h-[1.2rem] flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </Badge>
          )}
        </button>
      )}
    </div>
  );
}
