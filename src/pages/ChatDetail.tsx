import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Phone, Video } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { getDoctorById, getConversationMessages } from "@/data/mockData";
import { Message } from "@/types";

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const doctor = getDoctorById(id || "");
  
  // Load messages
  useEffect(() => {
    if (user && id) {
      const conversationMessages = getConversationMessages(user.id, id);
      setMessages(conversationMessages);
    }
  }, [user, id]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Send message
  const handleSendMessage = () => {
    if (!message.trim() || !user || !id) return;
    
    // In a real app, this would send a message to the API
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      receiverId: id,
      content: message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
  };
  
  // Format timestamp for display
  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "h:mm a");
    } catch (e) {
      return "";
    }
  };
  
  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groupedMessages: { [date: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = format(new Date(message.timestamp), "MMMM d, yyyy");
      
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      
      groupedMessages[date].push(message);
    });
    
    return groupedMessages;
  };
  
  const groupedMessages = groupMessagesByDate(messages);
  
  if (!doctor || !user) {
    return (
      <AppLayout title="Chat">
        <div className="p-4 text-center">
          <p>Conversation not found</p>
          <Button 
            onClick={() => navigate("/chat")} 
            className="mt-4"
          >
            Back to Chat
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout title={doctor.name}>
      {/* Doctor info */}
      <div className="border-b bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={doctor.avatar} alt={doctor.name} />
              <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h2 className="font-medium">{doctor.name}</h2>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto" style={{ paddingBottom: "5rem" }}>
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="text-center my-4">
              <span className="text-xs bg-gray-200 text-gray-600 py-1 px-2 rounded-full">
                {date}
              </span>
            </div>
            
            {dateMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex mb-4 ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
              >
                {msg.senderId !== user.id && (
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={`rounded-lg px-4 py-2 max-w-[75%] ${
                    msg.senderId === user.id 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p>{msg.content}</p>
                  <div 
                    className={`text-xs mt-1 ${
                      msg.senderId === user.id ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatMessageTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t p-3">
        <div className="flex items-center">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            className="ml-2" 
            size="icon"
            disabled={!message.trim()}
            onClick={handleSendMessage}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
