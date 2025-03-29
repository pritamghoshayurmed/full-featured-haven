
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
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
          onClick={() => navigate("/")}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={24} />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-gray-500">Please sign in to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="py-6"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="py-6"
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-base">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>
        
        <p className="mt-8 text-center text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
