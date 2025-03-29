
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { CardStackIcon, CreditCard, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPaymentMethods } from "@/data/mockData";

export default function PaymentCheckout() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const paymentMethods = getUserPaymentMethods(user?.id || "");
  
  const [selectedMethod, setSelectedMethod] = useState(
    paymentMethods.find(pm => pm.isDefault)?.id || ""
  );
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePayNow = () => {
    if (!selectedMethod) {
      toast({
        variant: "destructive",
        title: "Payment method required",
        description: "Please select a payment method",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // In a real app, this would call an API to process the payment
    setTimeout(() => {
      setIsProcessing(false);
      navigate("/payment-success");
    }, 2000);
  };
  
  return (
    <AppLayout title="Payment">
      <div className="p-4">
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Appointment Summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Appointment ID</span>
                <span className="font-medium">{appointmentId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor</span>
                <span className="font-medium">Dr. Sarah Johnson</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time</span>
                <span className="font-medium">Nov 20, 2023 at 10:00 AM</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Appointment Type</span>
                <span className="font-medium">Online Consultation</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Fee</span>
                <span>$120.00</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span>$5.00</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>$125.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Payment Method</h3>
            
            <RadioGroup 
              value={selectedMethod} 
              onValueChange={setSelectedMethod}
              className="space-y-3"
            >
              {paymentMethods.map(method => (
                <div 
                  key={method.id} 
                  className="flex items-center border rounded-lg p-3"
                >
                  <RadioGroupItem value={method.id} id={method.id} className="mr-3" />
                  <Label htmlFor={method.id} className="flex items-center cursor-pointer">
                    <CreditCard className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">{method.name}</p>
                      {method.expiryDate && (
                        <p className="text-sm text-gray-500">Expires {method.expiryDate}</p>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <Button 
              variant="outline" 
              className="w-full mt-3 flex items-center justify-center"
              onClick={() => navigate("/payment-methods")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Payment Method
            </Button>
          </CardContent>
        </Card>
        
        <Button 
          className="w-full py-6"
          onClick={handlePayNow}
          disabled={isProcessing || !selectedMethod}
        >
          {isProcessing ? (
            <>
              <CardStackIcon className="mr-2 h-4 w-4 animate-pulse" />
              Processing...
            </>
          ) : (
            "Pay Now - $125.00"
          )}
        </Button>
      </div>
    </AppLayout>
  );
}
