import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Loader2, IndianRupee, QrCode, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPaymentMethods } from "@/data/mockData";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

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
  const [paymentType, setPaymentType] = useState("card");
  const [upiId, setUpiId] = useState("");
  
  const handlePayNow = () => {
    if (paymentType === "card" && !selectedMethod) {
      toast({
        variant: "destructive",
        title: "Payment method required",
        description: "Please select a payment method",
      });
      return;
    }
    
    if (paymentType === "upi" && !upiId) {
      toast({
        variant: "destructive",
        title: "UPI ID required",
        description: "Please enter your UPI ID",
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
  
  // Dummy appointment data - would come from API in real implementation
  const appointmentData = {
    id: appointmentId,
    doctor: "Dr. Sarah Johnson",
    date: "Nov 20, 2023",
    time: "10:00 AM",
    type: "Online Consultation",
    fee: 1200,
    serviceFee: 50,
  };
  
  const totalAmount = appointmentData.fee + appointmentData.serviceFee;
  
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
                <span className="font-medium">{appointmentData.doctor}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time</span>
                <span className="font-medium">{appointmentData.date} at {appointmentData.time}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Appointment Type</span>
                <span className="font-medium">{appointmentData.type}</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Fee</span>
                <span>{formatCurrency(appointmentData.fee)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span>{formatCurrency(appointmentData.serviceFee)}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Payment Options</h3>
            
            <Tabs value={paymentType} onValueChange={setPaymentType} className="w-full mb-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="card" className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="upi" className="flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  UPI
                </TabsTrigger>
                <TabsTrigger value="qr" className="flex items-center">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {paymentType === "card" && (
              <>
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
              </>
            )}
            
            {paymentType === "upi" && (
              <div className="space-y-4">
                <div className="flex items-center border rounded-lg p-3">
                  <IndianRupee className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Pay using UPI</p>
                    <p className="text-sm text-gray-500">Google Pay, PhonePe, BHIM UPI, Paytm</p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="upi-id" className="text-sm font-medium mb-1 block">Enter UPI ID</Label>
                  <Input 
                    id="upi-id" 
                    placeholder="yourname@upi" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">e.g. yourname@okicici, yourname@ybl</p>
                </div>
              </div>
            )}
            
            {paymentType === "qr" && (
              <div className="flex flex-col items-center text-center p-3">
                <div className="border-2 border-primary rounded-lg p-2 mb-4">
                  <div className="w-56 h-56 bg-gray-100 flex items-center justify-center">
                    <QrCode className="h-32 w-32 text-primary" />
                  </div>
                </div>
                <p className="font-medium mb-1">Scan with any UPI app to pay</p>
                <p className="text-sm text-gray-500 mb-4">Google Pay, PhonePe, Paytm, or any other UPI app</p>
                <div className="flex justify-center space-x-4">
                  <img src="https://via.placeholder.com/40" alt="Google Pay" className="h-10" />
                  <img src="https://via.placeholder.com/40" alt="PhonePe" className="h-10" />
                  <img src="https://via.placeholder.com/40" alt="Paytm" className="h-10" />
                  <img src="https://via.placeholder.com/40" alt="BHIM" className="h-10" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Button 
          className="w-full py-6"
          onClick={handlePayNow}
          disabled={isProcessing || (paymentType === "card" && !selectedMethod) || (paymentType === "upi" && !upiId)}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay Now - ${formatCurrency(totalAmount)}`
          )}
        </Button>
      </div>
    </AppLayout>
  );
}
