import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { getAllDoctors, getConversationMessages } from "@/data/mockData";

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const doctors = getAllDoctors();
  
  // Filter doctors based on search query
  const filteredDoctors = searchQuery
    ? doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : doctors;
  
  // Get last message for each doctor
  const getLastMessage = (doctorId: string) => {
    if (!user) return null;
    
    const messages = getConversationMessages(user.id, doctorId);
    return messages.length > 0 ? messages[messages.length - 1] : null;
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      // If today, display time
      if (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      ) {
        return format(date, "h:mm a");
      }
      
      // If this week
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      if (date >= weekStart) {
        return format(date, "EEE");
      }
      
      // Otherwise, display date
      return format(date, "MM/dd/yy");
    } catch (e) {
      return timestamp;
    }
  };
  
  // Sort doctors by last message time
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    const lastMsgA = getLastMessage(a.id);
    const lastMsgB = getLastMessage(b.id);
    
    if (!lastMsgA && !lastMsgB) return 0;
    if (!lastMsgA) return 1;
    if (!lastMsgB) return -1;
    
    return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
  });
  
  return (
    <AppLayout title="Messages" showBack={false}>
      <div className="p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Chat list */}
        <div className="space-y-2">
          {sortedDoctors.map(doctor => {
            const lastMessage = getLastMessage(doctor.id);
            
            return (
              <button
                key={doctor.id}
                className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                onClick={() => navigate(`/chat/${doctor.id}`)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{doctor.name}</h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage 
                      ? lastMessage.content 
                      : "No messages yet"}
                  </p>
                </div>
                
                {lastMessage && !lastMessage.read && lastMessage.senderId === doctor.id && (
                  <Badge className="ml-2 bg-primary">New</Badge>
                )}
              </button>
            );
          })}
          
          {filteredDoctors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No conversations found</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
