import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers, getConversationMessages } from "@/data/mockData";
import { User as UserType, Message } from "@/types";

export default function DoctorChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<UserType[]>([]);
  const [conversations, setConversations] = useState<{ [key: string]: Message[] }>({});
  
  useEffect(() => {
    // Redirect if not a doctor
    if (user?.role !== "doctor") {
      navigate("/dashboard");
      return;
    }
    
    // Get all patients
    const allUsers = getAllUsers();
    const patientsList = allUsers.filter(u => u.role === "patient");
    setPatients(patientsList);
    
    // Get conversations with each patient
    const convoMap: { [key: string]: Message[] } = {};
    
    patientsList.forEach(patient => {
      if (user) {
        const messages = getConversationMessages(user.id, patient.id);
        if (messages.length > 0) {
          convoMap[patient.id] = messages;
        }
      }
    });
    
    setConversations(convoMap);
  }, [user, navigate]);
  
  // Filter patients based on search query
  const filteredPatients = searchQuery
    ? patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patients;
  
  // Get last message for each patient
  const getLastMessage = (patientId: string) => {
    return conversations[patientId]?.length > 0 
      ? conversations[patientId][conversations[patientId].length - 1] 
      : null;
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
  
  // Get patients with conversations first, then sort by last message time
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const hasConvoA = conversations[a.id]?.length > 0;
    const hasConvoB = conversations[b.id]?.length > 0;
    
    // If one has conversation and other doesn't, prioritize the one with conversation
    if (hasConvoA && !hasConvoB) return -1;
    if (!hasConvoA && hasConvoB) return 1;
    
    // If both have conversations, sort by timestamp
    if (hasConvoA && hasConvoB) {
      const lastMsgA = getLastMessage(a.id);
      const lastMsgB = getLastMessage(b.id);
      
      if (!lastMsgA || !lastMsgB) return 0;
      return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
    }
    
    // If neither has conversations, sort alphabetically
    return a.name.localeCompare(b.name);
  });
  
  // Count unread messages from a patient
  const getUnreadCount = (patientId: string) => {
    if (!conversations[patientId]) return 0;
    
    return conversations[patientId].filter(
      msg => !msg.read && msg.senderId === patientId
    ).length;
  };
  
  return (
    <AppLayout title="Patient Messages" showBack={false}>
      <div className="p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search patients..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Chat list */}
        <div className="space-y-2">
          {sortedPatients.map(patient => {
            const lastMessage = getLastMessage(patient.id);
            const unreadCount = getUnreadCount(patient.id);
            
            return (
              <button
                key={patient.id}
                className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                onClick={() => navigate(`/chat/${patient.id}`)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={patient.avatar} alt={patient.name} />
                    <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{patient.name}</h3>
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
                
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-primary">{unreadCount}</Badge>
                )}
              </button>
            );
          })}
          
          {filteredPatients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No patients found</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 