import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Get all chats for the current user
const getUserChats = async () => {
  try {
    const response = await axios.get(`${API_URL}/chats`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock chats');
      return [];
    }
    throw error;
  }
};

// Get a single chat by ID with messages
const getChatById = async (chatId: string) => {
  try {
    const response = await axios.get(`${API_URL}/chats/${chatId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching chat:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock chat');
      return {
        id: chatId,
        messages: [],
        participants: []
      };
    }
    throw error;
  }
};

// Create or get an existing chat with another user
const getOrCreateChat = async (userId: string) => {
  try {
    const response = await axios.post(`${API_URL}/chats`, { userId });
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating chat:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock chat');
      return {
        id: 'mock-chat-' + Date.now(),
        messages: [],
        participants: [{ id: 'current-user' }, { id: userId }]
      };
    }
    throw error;
  }
};

// Send a message in a chat
const sendMessage = async (chatId: string, content: string) => {
  try {
    const response = await axios.post(`${API_URL}/chats/${chatId}/messages`, { content });
    return response.data.data;
  } catch (error: any) {
    console.error('Error sending message:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock message');
      return {
        id: 'mock-msg-' + Date.now(),
        content,
        sender: 'current-user',
        timestamp: new Date().toISOString()
      };
    }
    throw error;
  }
};

// Get all AI chats for the current user
const getAIChats = async () => {
  try {
    const response = await axios.get(`${API_URL}/ai/chats`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching AI chats:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock AI chats');
      return [];
    }
    throw error;
  }
};

// Get a single AI chat by ID
const getAIChatById = async (chatId: string) => {
  try {
    const response = await axios.get(`${API_URL}/ai/chats/${chatId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching AI chat:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock AI chat');
      return {
        id: chatId,
        messages: [],
        title: 'Mock AI Chat'
      };
    }
    throw error;
  }
};

// Send a message to the AI and get a response
const sendMessageToAI = async (message: string, chatId?: string) => {
  try {
    console.log('Sending message to AI:', { message, chatId });
    const response = await axios.post(`${API_URL}/ai/chat`, { message, chatId });
    console.log('AI response:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error sending message to AI:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock AI response');
      const mockChat = {
        id: chatId || 'mock-ai-chat-' + Date.now(),
        title: message.substring(0, 20) + '...',
        messages: [
          {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
          },
          {
            role: 'assistant',
            content: "I'm a mock AI response. The backend server appears to be offline. Please try again later.",
            timestamp: new Date(Date.now() + 1000).toISOString()
          }
        ]
      };
      return mockChat;
    }
    throw error;
  }
};

// Share an AI chat summary with a doctor
const shareAIChatWithDoctor = async (chatId: string, doctorId: string) => {
  try {
    const response = await axios.post(`${API_URL}/ai/chats/${chatId}/share`, { doctorId });
    return response.data.data;
  } catch (error: any) {
    console.error('Error sharing AI chat:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock share response');
      return {
        success: true,
        id: 'mock-share-' + Date.now(),
        chatId,
        doctorId
      };
    }
    throw error;
  }
};

// Delete an AI chat
const deleteAIChat = async (chatId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/ai/chats/${chatId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting AI chat:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock delete response');
      return {
        success: true,
        message: 'Chat deleted successfully (mock)'
      };
    }
    throw error;
  }
};

// Get AI chat summaries shared with doctor (for doctors only)
const getSharedAIChats = async () => {
  try {
    const response = await axios.get(`${API_URL}/doctors/ai-chats`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching shared AI chats:', error);
    // Return mock data if network error
    if (error.code === 'ERR_NETWORK') {
      console.log('Network error, returning mock shared AI chats');
      return [];
    }
    throw error;
  }
};

export const chatService = {
  getUserChats,
  getChatById,
  getOrCreateChat,
  sendMessage,
  getAIChats,
  getAIChatById,
  sendMessageToAI,
  shareAIChatWithDoctor,
  deleteAIChat,
  getSharedAIChats
};

export default chatService; 