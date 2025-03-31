import React, { createContext, useContext, useState, useEffect } from 'react';
import chatService from '@/services/chat.service';
import { useAuth } from './AuthContext';

// Define types for our chat context
interface Message {
  id: string;
  sender: any;
  content: string;
  readBy: string[];
  createdAt: string;
  timestamp?: string; // For AI messages
}

interface Chat {
  _id: string;
  participants: any[];
  latestMessage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIChat {
  _id: string;
  user: string;
  title: string;
  messages: AIMessage[];
  summary?: string;
  sharedWithDoctor?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loadingChats: boolean;
  loadingMessages: boolean;
  aiChats: AIChat[];
  currentAIChat: AIChat | null;
  loadingAIChats: boolean;
  
  // Regular chat methods
  loadChats: () => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  createOrGetChat: (userId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  
  // AI chat methods
  loadAIChats: () => Promise<void>;
  loadAIChat: (chatId: string) => Promise<void>;
  sendMessageToAI: (message: string) => Promise<void>;
  createNewAIChat: () => void;
  shareAIChatWithDoctor: (doctorId: string) => Promise<void>;
  deleteAIChat: () => Promise<void>;
  
  // For doctors
  loadSharedAIChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Regular chat state
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // AI chat state
  const [aiChats, setAIChats] = useState<AIChat[]>([]);
  const [currentAIChat, setCurrentAIChat] = useState<AIChat | null>(null);
  const [loadingAIChats, setLoadingAIChats] = useState(false);
  
  // Clear state on logout
  useEffect(() => {
    if (!user) {
      setChats([]);
      setCurrentChat(null);
      setMessages([]);
      setAIChats([]);
      setCurrentAIChat(null);
    }
  }, [user]);
  
  // Regular chat methods
  const loadChats = async () => {
    if (!user) return;
    
    setLoadingChats(true);
    try {
      const data = await chatService.getUserChats();
      setChats(data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };
  
  const loadChat = async (chatId: string) => {
    if (!user) return;
    
    setLoadingMessages(true);
    try {
      const data = await chatService.getChatById(chatId);
      setCurrentChat(data.chat);
      setMessages(data.messages);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoadingMessages(false);
    }
  };
  
  const createOrGetChat = async (userId: string) => {
    if (!user) return;
    
    setLoadingMessages(true);
    try {
      const data = await chatService.getOrCreateChat(userId);
      setCurrentChat(data.chat);
      setMessages(data.messages || []);
      
      // Update chats list if this is a new chat
      if (!chats.find(chat => chat._id === data.chat._id)) {
        setChats(prevChats => [...prevChats, data.chat]);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setLoadingMessages(false);
    }
  };
  
  const sendMessage = async (content: string) => {
    if (!user || !currentChat) return;
    
    try {
      const newMessage = await chatService.sendMessage(currentChat._id, content);
      setMessages(prevMessages => [...prevMessages, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // AI chat methods
  const loadAIChats = async () => {
    if (!user) return;
    
    setLoadingAIChats(true);
    try {
      const data = await chatService.getAIChats();
      setAIChats(data);
    } catch (error) {
      console.error('Error loading AI chats:', error);
    } finally {
      setLoadingAIChats(false);
    }
  };
  
  const loadAIChat = async (chatId: string) => {
    if (!user) return;
    
    setLoadingAIChats(true);
    try {
      const data = await chatService.getAIChatById(chatId);
      setCurrentAIChat(data);
    } catch (error) {
      console.error('Error loading AI chat:', error);
    } finally {
      setLoadingAIChats(false);
    }
  };
  
  const sendMessageToAI = async (message: string) => {
    if (!user) return;
    
    try {
      const chatId = currentAIChat?._id;
      const response = await chatService.sendMessageToAI(message, chatId);
      
      // If this is a new chat or we got a full chat back, update directly
      if (response.id && response.messages) {
        setCurrentAIChat(response);
        
        // Also update the chats list if needed
        if (!aiChats.some(chat => chat._id === response.id)) {
          setAIChats(prevChats => [response, ...prevChats]);
        }
      } else if (currentAIChat) {
        // Legacy format - add the new message to the current chat
        setCurrentAIChat(prevChat => {
          if (!prevChat) return null;
          
          return {
            ...prevChat,
            messages: [
              ...prevChat.messages,
              { role: 'user', content: message, timestamp: new Date().toISOString() },
              { role: 'assistant', content: response.message.content, timestamp: response.message.timestamp }
            ]
          };
        });
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      // Add user message anyway, even if the API call failed
      if (currentAIChat) {
        setCurrentAIChat(prevChat => {
          if (!prevChat) return null;
          
          return {
            ...prevChat,
            messages: [
              ...prevChat.messages,
              { role: 'user', content: message, timestamp: new Date().toISOString() },
              { 
                role: 'assistant', 
                content: "I'm sorry, I'm having trouble connecting to my knowledge base. Please try again in a moment.", 
                timestamp: new Date().toISOString() 
              }
            ]
          };
        });
      }
    }
  };
  
  const createNewAIChat = () => {
    setCurrentAIChat(null);
  };
  
  const shareAIChatWithDoctor = async (doctorId: string) => {
    if (!user || !currentAIChat) return;
    
    try {
      const result = await chatService.shareAIChatWithDoctor(currentAIChat._id, doctorId);
      
      // Update the current AI chat with the summary
      setCurrentAIChat(prevChat => {
        if (!prevChat) return null;
        
        return {
          ...prevChat,
          summary: result.summary,
          sharedWithDoctor: doctorId
        };
      });
      
      return result;
    } catch (error) {
      console.error('Error sharing AI chat:', error);
      throw error;
    }
  };
  
  const deleteAIChat = async () => {
    if (!user || !currentAIChat) return;
    
    try {
      await chatService.deleteAIChat(currentAIChat._id);
      
      // Remove the chat from the list and clear current chat
      setAIChats(prevChats => prevChats.filter(chat => chat._id !== currentAIChat._id));
      setCurrentAIChat(null);
    } catch (error) {
      console.error('Error deleting AI chat:', error);
      throw error;
    }
  };
  
  const loadSharedAIChats = async () => {
    if (!user || user.role !== 'doctor') return;
    
    setLoadingAIChats(true);
    try {
      const data = await chatService.getSharedAIChats();
      setAIChats(data);
    } catch (error) {
      console.error('Error loading shared AI chats:', error);
    } finally {
      setLoadingAIChats(false);
    }
  };
  
  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        messages,
        loadingChats,
        loadingMessages,
        aiChats,
        currentAIChat,
        loadingAIChats,
        loadChats,
        loadChat,
        createOrGetChat,
        sendMessage,
        loadAIChats,
        loadAIChat,
        sendMessageToAI,
        createNewAIChat,
        shareAIChatWithDoctor,
        deleteAIChat,
        loadSharedAIChats
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 