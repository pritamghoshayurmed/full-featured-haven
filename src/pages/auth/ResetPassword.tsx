
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if we have a hash fragment that indicates we're on a password reset page
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) {
      toast({
        variant: "destructive",
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired."
      });
      navigate("/forgot-password");
    }
  }, [navigate, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });
      
      // Short delay before redirecting to login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reset password");
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: err.message || "There was an error resetting your password."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-4">
        <button
          onClick={() => navigate("/login")}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={24} />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-gray-500">
            Please enter your new password
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="py-6"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="py-6"
            />
          </div>
          
          {error && (
            <div className="text-sm font-medium text-destructive mt-2">
              {error}
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isSubmitting || !password || !confirmPassword} 
            className="w-full py-6 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
