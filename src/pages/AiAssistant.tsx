
import { useState } from "react";
import { Send, Bot, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AiAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm KABIRAJ AI. How can I assist you with your health concerns today?",
      sender: "ai",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Mock AI response (in a real app, this would call an API)
    setTimeout(() => {
      // Example AI response based on user input
      let response = "I'm sorry, I don't understand. Can you please provide more details about your symptoms?";
      
      const lowerCaseInput = inputMessage.toLowerCase();
      
      // Simple pattern matching for symptoms
      if (
        lowerCaseInput.includes("headache") || 
        lowerCaseInput.includes("head") && lowerCaseInput.includes("pain")
      ) {
        response = "Headaches can be caused by various factors including stress, dehydration, lack of sleep, or more serious conditions. Try drinking water, resting, and if the pain persists for more than a day or is severe, I recommend consulting with a neurologist.";
      } else if (
        lowerCaseInput.includes("fever") || 
        lowerCaseInput.includes("temperature")
      ) {
        response = "A fever is often a sign that your body is fighting an infection. Rest, stay hydrated, and take over-the-counter fever reducers if needed. If your temperature exceeds 103°F (39.4°C) or lasts more than three days, please consult with a general physician.";
      } else if (
        lowerCaseInput.includes("cough") || 
        lowerCaseInput.includes("cold") ||
        lowerCaseInput.includes("congestion")
      ) {
        response = "Coughs and colds are usually caused by viral infections. Rest, drink fluids, and use over-the-counter cold medications if needed. If symptoms persist for more than a week or are severe, you should consult with a respiratory specialist.";
      } else if (
        lowerCaseInput.includes("stomach") || 
        lowerCaseInput.includes("abdomen") ||
        lowerCaseInput.includes("nausea") ||
        lowerCaseInput.includes("vomit")
      ) {
        response = "Stomach issues can be caused by food poisoning, indigestion, or more serious conditions. Try eating bland foods, staying hydrated, and if symptoms persist or are severe, please consult with a gastroenterologist.";
      }
      
      // Add AI response
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
      // If this is the second user message, suggest finding doctors
      if (messages.filter(m => m.sender === 'user').length === 1) {
        setTimeout(() => {
          const followUpMessage: Message = {
            id: Date.now().toString(),
            content: "Would you like me to help you find doctors in your area who specialize in treating this condition?",
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, followUpMessage]);
        }, 2000);
      }
    }, 2000);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFindDoctorsNearby = () => {
    toast({
      title: "Location access",
      description: "Please allow access to your location to find doctors nearby.",
      action: (
        <Button onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // Mock finding doctors near user location
              toast({
                title: "Doctors found near you",
                description: "We've found several specialists in your area.",
              });
              
              // In a real app, this would use the position to query an API
              setTimeout(() => {
                navigate('/doctors');
              }, 1500);
            },
            (error) => {
              toast({
                variant: "destructive",
                title: "Location access denied",
                description: "We couldn't access your location. Please enable location services and try again.",
              });
            }
          );
        }}>
          Allow
        </Button>
      ),
    });
  };
  
  const navigate = useNavigate();
  
  return (
    <AppLayout title="KABIRAJ AI Assistant">
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {message.sender === "ai" && (
                    <div className="flex items-center mb-1">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src="/placeholder.svg" alt="AI" />
                        <AvatarFallback>
                          <Bot size={16} />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">KABIRAJ AI</span>
                    </div>
                  )}
                  <p className={message.sender === "user" ? "text-white" : "text-gray-800"}>
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
          
          {messages.some(m => 
            m.sender === 'ai' && 
            m.content.includes("find doctors in your area")
          ) && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <p>Find specialists in your area</p>
                  <Button onClick={handleFindDoctorsNearby}>
                    Find Nearby Doctors
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
