
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function OtpVerification() {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await verifyOTP(otp);
      if (success) {
        toast({
          title: "Verification successful",
          description: "Your account has been verified successfully.",
        });
        navigate("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: "Invalid OTP. Please try again.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "There was an error verifying your OTP. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      // In a real app, this would call an API to resend the OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email/phone.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to resend OTP",
        description: "There was an error resending the OTP. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={24} />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">OTP Verification</h1>
          <p className="text-gray-500">
            Enter the verification code sent to your email/phone
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, index) => (
                    <InputOTPSlot key={index} {...slot} index={index} />
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting || otp.length !== 6} className="w-full py-6 text-base">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-2">Didn't receive the code?</p>
          <Button
            variant="link"
            onClick={handleResendOTP}
            disabled={isResending}
            className="text-primary"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              "Resend OTP"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
