import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Loader2, IndianRupee, QrCode, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { appointmentService } from "@/services/appointment.service";
import doctorService from "@/services/doctor.service";
import { format } from "date-fns";

// Demo card details for testing
const DEMO_CARD = {
  id: "demo-card",
  name: "Demo Card (4242 4242 4242 4242)",
  expiryDate: "12/25",
  isDefault: true
};

export default function PaymentCheckout() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Payment state
  const [selectedMethod, setSelectedMethod] = useState(DEMO_CARD.id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState("card");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  
  // Appointment and doctor data
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!appointmentId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch appointment details
        const appointment = await appointmentService.getAppointmentById(appointmentId);
        setAppointmentData(appointment);
        
        // Fetch doctor details
        if (appointment?.doctor?._id || appointment?.doctor) {
          const doctorId = appointment.doctor._id || appointment.doctor;
          const doctorData = await doctorService.getDoctorById(doctorId);
          setDoctor(doctorData);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load appointment details.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [appointmentId, toast]);
  
  const handlePayNow = async () => {
    if (paymentType === "card" && !selectedMethod && !cardNumber) {
      toast({
        variant: "destructive",
        title: "Payment method required",
        description: "Please select or enter a payment method",
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
    
    try {
      // Check if using demo card
      const isDemoCard = selectedMethod === DEMO_CARD.id || cardNumber.replace(/\s/g, "") === "4242424242424242";
      
      if (isDemoCard) {
        // Process payment with demo card
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        
        // Update appointment payment status
        if (appointmentId) {
          try {
            // In a real implementation, this would be a proper payment processing API call
            // Here we're just updating the appointment status directly
            await appointmentService.updatePaymentStatus(appointmentId, "completed");
          } catch (error) {
            console.error("Error updating payment status:", error);
          }
        }
        
        navigate("/payment-success", { 
          state: { 
            transactionId: `TXN${Date.now()}`,
            appointmentId
          } 
        });
      } else {
        // In a real app, this would call a payment gateway API
        toast({
          variant: "destructive",
          title: "Use demo card",
          description: "For testing, please use the Demo Card or card number 4242 4242 4242 4242",
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
      });
      setIsProcessing(false);
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  if (isLoading) {
    return (
      <AppLayout title="Payment">
        <div className="p-4 h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!appointmentData || !doctor) {
    return (
      <AppLayout title="Payment">
        <div className="p-4 text-center">
          <p className="mb-4">Appointment details not found</p>
          <Button 
            onClick={() => navigate("/appointments")} 
            className="mt-2"
          >
            View My Appointments
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  // Calculate total amount
  const consultationFee = doctor.consultationFee || doctor.fee || 0;
  const serviceFee = 50; // Fixed service fee
  const totalAmount = consultationFee + serviceFee;
  
  return (
    <AppLayout title="Payment">
      <div className="p-4">
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Appointment Summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Appointment ID</span>
                <span className="font-medium">{appointmentData.id || appointmentId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor</span>
                <span className="font-medium">{doctor.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time</span>
                <span className="font-medium">
                  {formatDate(appointmentData.date)} at {appointmentData.startTime || appointmentData.time}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Appointment Type</span>
                <span className="font-medium">
                  {appointmentData.type === 'ONLINE' || appointmentData.type === 'online' 
                    ? 'Online Consultation' 
                    : 'In-person Visit'}
                </span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Fee</span>
                <span>{formatCurrency(consultationFee)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span>{formatCurrency(serviceFee)}</span>
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
                  <div className="flex items-center border rounded-lg p-3">
                    <RadioGroupItem value={DEMO_CARD.id} id={DEMO_CARD.id} className="mr-3" />
                    <Label htmlFor={DEMO_CARD.id} className="flex items-center cursor-pointer">
                      <CreditCard className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <p className="font-medium">{DEMO_CARD.name}</p>
                        <p className="text-sm text-gray-500">Expires {DEMO_CARD.expiryDate}</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input 
                      id="card-number" 
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input 
                        id="expiry" 
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="w-1/3">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
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
          disabled={isProcessing}
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
