
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPaymentMethods } from "@/data/mockData";

export default function PaymentMethods() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const paymentMethods = getUserPaymentMethods(user?.id || "");
  
  const [selectedMethod, setSelectedMethod] = useState(
    paymentMethods.find(pm => pm.isDefault)?.id || ""
  );
  const [openDialog, setOpenDialog] = useState(false);
  
  // Form state for new payment method
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  
  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill out all fields",
      });
      return;
    }
    
    // In a real app, this would call an API to add the payment method
    toast({
      title: "Payment method added",
      description: "Your new payment method has been added successfully",
    });
    
    // Close dialog and reset form
    setOpenDialog(false);
    setCardNumber("");
    setCardName("");
    setExpiryDate("");
    setCvv("");
  };
  
  const handleDeletePaymentMethod = (id: string) => {
    // In a real app, this would call an API to delete the payment method
    toast({
      title: "Payment method removed",
      description: "Your payment method has been removed successfully",
    });
  };
  
  return (
    <AppLayout title="Payment Methods">
      <div className="p-4">
        <RadioGroup 
          value={selectedMethod} 
          onValueChange={setSelectedMethod}
          className="space-y-3 mb-6"
        >
          {paymentMethods.map(method => (
            <div 
              key={method.id} 
              className="flex items-center justify-between border rounded-lg p-4"
            >
              <div className="flex items-center">
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
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDeletePaymentMethod(method.id)}
              >
                <Trash2 className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          ))}
        </RadioGroup>
        
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center py-6"
          onClick={() => setOpenDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Payment Method
        </Button>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleAddPaymentMethod} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  placeholder="John Smith"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    type="password"
                  />
                </div>
              </div>
              
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full">Add Payment Method</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
