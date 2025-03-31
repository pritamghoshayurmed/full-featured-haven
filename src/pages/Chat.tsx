import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Send, 
  User, 
  Clock, 
  Search,
  Loader2 
} from 'lucide-react';
import { formatDate, formatTime, cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types/user';

const Chat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const { 
    chats, 
    currentChat, 
    messages, 
    loadingChats,
    loadingMessages,
    loadChats,
    loadChat,
    createOrGetChat,
    sendMessage
  } = useChat();
  
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Load specific chat when chatId changes
  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    }
  }, [chatId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    try {
      await sendMessage(messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    // Find the other participant (not the current user)
    const otherParticipant = chat.participants.find(p => p.id !== user?.id);
    if (!otherParticipant) return false;
    
    const name = `${otherParticipant.firstName} ${otherParticipant.lastName}`;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[calc(100vh-4rem)]">
      {/* Chats sidebar */}
      <div className="md:col-span-1 border rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-2">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-11rem)]">
          {loadingChats ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchTerm ? 'No contacts found' : 'No conversations yet'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredChats.map(chat => {
                // Find the other participant (not the current user)
                const otherParticipant = chat.participants.find(p => p.id !== user?.id);
                
                return (
                  <Link 
                    key={chat._id} 
                    to={`/chat/${chat._id}`}
                    className={cn(
                      "block p-4 hover:bg-accent transition-colors",
                      currentChat?._id === chat._id && "bg-accent"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {otherParticipant?.profilePicture ? (
                          <img 
                            src={otherParticipant.profilePicture} 
                            alt={otherParticipant.firstName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium truncate">
                            {otherParticipant?.firstName} {otherParticipant?.lastName}
                          </h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatDate(chat.updatedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.latestMessage || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
      
      {/* Chat area */}
      <div className="md:col-span-2 lg:col-span-3 border rounded-lg overflow-hidden flex flex-col">
        {currentChat ? (
          <>
            <CardHeader className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentChat.participants.find(p => p.id !== user?.id)?.profilePicture ? (
                    <img 
                      src={currentChat.participants.find(p => p.id !== user?.id)?.profilePicture} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {currentChat.participants.find(p => p.id !== user?.id)?.firstName} {currentChat.participants.find(p => p.id !== user?.id)?.lastName}
                    </CardTitle>
                    {user?.role === UserRole.PATIENT && (
                      <p className="text-sm text-muted-foreground">
                        {currentChat.participants.find(p => p.role === UserRole.DOCTOR)?.doctorProfile?.specialization}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Last active {formatTime(currentChat.updatedAt)}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Start a conversation</h3>
                  <p className="text-muted-foreground">
                    Send a message to start chatting with {currentChat.participants.find(p => p.id !== user?.id)?.firstName}
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = message.sender.id === user?.id;
                  const showAvatar = index === 0 || messages[index - 1].sender.id !== message.sender.id;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={cn(
                        "flex gap-3",
                        isCurrentUser ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isCurrentUser && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center self-end">
                          {message.sender.profilePicture ? (
                            <img 
                              src={message.sender.profilePicture} 
                              alt={message.sender.firstName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                      )}
                      
                      <div 
                        className={cn(
                          "max-w-[70%] rounded-lg p-3 relative group",
                          isCurrentUser 
                            ? "bg-primary text-primary-foreground rounded-br-none" 
                            : "bg-accent rounded-bl-none"
                        )}
                      >
                        <p>{message.content}</p>
                        <span className="text-xs opacity-70 text-right block mt-1">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      
                      {isCurrentUser && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center self-end">
                          {user?.profilePicture ? (
                            <img 
                              src={user.profilePicture} 
                              alt={user.firstName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            
            <CardFooter className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-1">Select a conversation</h3>
            <p className="text-muted-foreground mb-4">
              Choose a contact from the list or start a new conversation
            </p>
            
            {user?.role === UserRole.PATIENT && (
              <Link to="/doctors">
                <Button>
                  Find a Doctor
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
