
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  CreditCard, 
  HelpCircle, 
  Info, 
  LogOut, 
  Settings, 
  Shield, 
  Star, 
  User 
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };
  
  return (
    <AppLayout title="Profile" showBack={false}>
      <div className="p-4">
        {/* User info */}
        <div className="flex items-center mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="ml-4">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-gray-500">{user?.phone}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mb-6"
          onClick={() => navigate("/profile/edit")}
        >
          Edit Profile
        </Button>
        
        {/* Account settings */}
        <div className="space-y-1 mb-6">
          <h3 className="text-sm font-medium text-gray-500 px-2">Account Settings</h3>
          
          <button 
            className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-5 w-5 text-gray-500 mr-3" />
            <span>Notifications</span>
          </button>
          
          <button 
            className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg"
            onClick={() => navigate("/payment-methods")}
          >
            <CreditCard className="h-5 w-5 text-gray-500 mr-3" />
            <span>Payment Methods</span>
          </button>
          
          <button 
            className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg"
            onClick={() => navigate("/profile/edit")}
          >
            <User className="h-5 w-5 text-gray-500 mr-3" />
            <span>Personal Information</span>
          </button>
        </div>
        
        <Separator className="my-4" />
        
        {/* More options */}
        <div className="space-y-1 mb-6">
          <h3 className="text-sm font-medium text-gray-500 px-2">More</h3>
          
          <button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg">
            <HelpCircle className="h-5 w-5 text-gray-500 mr-3" />
            <span>Help Center</span>
          </button>
          
          <button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg">
            <Shield className="h-5 w-5 text-gray-500 mr-3" />
            <span>Privacy Policy</span>
          </button>
          
          <button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg">
            <Star className="h-5 w-5 text-gray-500 mr-3" />
            <span>Rate the App</span>
          </button>
          
          <button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg">
            <Info className="h-5 w-5 text-gray-500 mr-3" />
            <span>About</span>
          </button>
        </div>
        
        {/* Logout */}
        <button 
          className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-lg"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </AppLayout>
  );
}
