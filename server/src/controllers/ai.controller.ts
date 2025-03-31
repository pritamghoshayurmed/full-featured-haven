import { Request, Response } from 'express';
import { AIChat, IAIChat } from '../models/chat.model';
import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyCCnpvcMoam6ufW9w9HkaR-hJ7UyMonZyQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
const SYSTEM_PROMPT = 'act as a expert doctor to diagonise the diseasease you ask 4-5 question then give a proper diagonisis.';

// @desc    Start or continue an AI chat
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message, chatId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if continuing an existing chat or starting a new one
    let aiChat: IAIChat | null = null;

    if (chatId) {
      aiChat = await AIChat.findById(chatId);
      
      // Verify the chat belongs to the user
      if (aiChat && aiChat.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this chat'
        });
      }
    }

    // Start a new chat if needed
    if (!aiChat) {
      aiChat = new AIChat({
        user: req.user.id,
        title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
        messages: []
      });
    }

    // Add the user message
    aiChat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Get the conversation history for context (last 10 messages)
    const history = aiChat.messages
      .slice(-10)
      .map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }));

    // Add system prompt for new conversations or if needed
    const isNewConversation = aiChat.messages.length <= 1;
    const contents = isNewConversation 
      ? [
          {
            role: "system",
            parts: [{ text: SYSTEM_PROMPT }]
          },
          ...history
        ]
      : history;

    // Call the Gemini API
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Add type checking for response.data
      const responseData = response.data as any;
      let aiResponse = "";
      
      try {
        aiResponse = responseData.candidates[0].content.parts[0].text;
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.log('Raw response:', JSON.stringify(responseData));
        aiResponse = "I'm sorry, I couldn't provide a proper diagnosis at this time. Please try again or consult with a healthcare professional.";
      }

      // Add the AI's response to the chat
      aiChat.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      // Save the updated chat
      await aiChat.save();

      res.status(200).json({
        success: true,
        data: {
          id: aiChat._id,
          title: aiChat.title,
          messages: aiChat.messages
        }
      });
    } catch (apiError: any) {
      console.error('Gemini API error:', apiError.response?.data || apiError.message);
      
      // Still save the user message even if the API fails
      await aiChat.save();
      
      return res.status(500).json({
        success: false,
        message: 'Error communicating with AI service',
        error: apiError.response?.data?.error || apiError.message
      });
    }
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing AI chat'
    });
  }
};

// @desc    Get AI chat history for a user
// @route   GET /api/ai/chats
// @access  Private
export const getAIChats = async (req: Request, res: Response) => {
  try {
    const chats = await AIChat.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt');

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    console.error('Get AI chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching AI chats'
    });
  }
};

// @desc    Get single AI chat by ID
// @route   GET /api/ai/chats/:id
// @access  Private
export const getAIChatById = async (req: Request, res: Response) => {
  try {
    const chat = await AIChat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify the chat belongs to the user
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Get AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching AI chat'
    });
  }
};

// @desc    Generate summary of AI chat and share with doctor
// @route   POST /api/ai/chats/:id/share
// @access  Private
export const shareAIChatWithDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }

    const chat = await AIChat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify the chat belongs to the user
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this chat'
      });
    }

    // Generate a summary of the chat using Gemini API
    try {
      // Get all chat messages
      const allMessages = chat.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: `Please summarize the following medical conversation in a concise manner highlighting the key symptoms, concerns, and any potential diagnoses discussed:\n\n${allMessages}` }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Add type checking for response.data
      const responseData = response.data as any;
      const summary = responseData.candidates[0].content.parts[0].text;

      // Update the chat with the summary and shared doctor
      chat.summary = summary;
      chat.sharedWithDoctor = doctorId;
      await chat.save();

      res.status(200).json({
        success: true,
        data: {
          summary,
          sharedWithDoctor: doctorId
        }
      });
    } catch (apiError: any) {
      console.error('Gemini API error generating summary:', apiError.response?.data || apiError.message);
      return res.status(500).json({
        success: false,
        message: 'Error generating chat summary',
        error: apiError.response?.data?.error || apiError.message
      });
    }
  } catch (error) {
    console.error('Share AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sharing AI chat'
    });
  }
};

// @desc    Delete AI chat
// @route   DELETE /api/ai/chats/:id
// @access  Private
export const deleteAIChat = async (req: Request, res: Response) => {
  try {
    const chat = await AIChat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify the chat belongs to the user
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this chat'
      });
    }

    await chat.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting AI chat'
    });
  }
}; 