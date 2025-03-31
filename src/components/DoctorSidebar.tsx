import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Home,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Users,
  BarChart,
  Brain,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DoctorSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  
  const navItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/doctor/dashboard",
    },
    {
      name: "Patients",
      icon: Users,
      path: "/doctor/patients",
    },
    {
      name: "Analytics",
      icon: BarChart,
      path: "/doctor/analytics",
    },
    {
      name: "AI Assistant",
      icon: Brain,
      path: "/doctor/ai-assistant",
    },
    {
      name: "Messages",
      icon: MessageSquare,
      path: "/chat",
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
    {
      name: "Profile",
      icon: User,
      path: "/profile",
    },
  ];
  
  return (
    <div className="h-full w-full flex flex-col bg-background border-r">
      {/* Profile section */}
      <div className="p-6 flex items-center border-b">
        <Avatar className="h-10 w-10 mr-4">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-muted-foreground">Doctor</p>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "justify-start h-10 px-4",
                location.pathname === item.path && "bg-muted"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Button>
          ))}
        </nav>
      </div>
      
      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
} 