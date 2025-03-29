
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Welcome() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-primary text-white text-center">
        <div className="mb-8 w-20 h-20 bg-white rounded-lg flex items-center justify-center">
          <Plus className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">MediCare</h1>
        <p className="text-lg mb-8 max-w-md opacity-90">
          Your health is our priority. Connect with top doctors and manage your healthcare journey.
        </p>
      </div>
      
      {/* Buttons */}
      <div className="p-6 space-y-4">
        <Button asChild className="w-full py-6 text-base">
          <Link to="/login">Log In</Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full py-6 text-base">
          <Link to="/register">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
