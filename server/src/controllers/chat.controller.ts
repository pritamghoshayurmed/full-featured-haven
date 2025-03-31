import { Request, Response } from 'express';
import { Chat, Message } from '../models/chat.model';
import User from '../models/user.model';
import Doctor from '../models/doctor.model';
import Patient from '../models/patient.model';
import mongoose from 'mongoose';

// @desc    Get or create chat
// @route   POST /api/chats
// @access  Private
export const getOrCreateChat = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if chat already exists between users
    const existingChat = await Chat.findOne({
      participants: {
        $all: [req.user.id, userId],
        $size: 2
      }
    });

    if (existingChat) {
      // Get latest messages for the chat
      const messages = await Message.find({ chat: existingChat._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('sender', 'firstName lastName profilePicture');

      return res.status(200).json({
        success: true,
        data: {
          chat: existingChat,
          messages: messages.reverse()
        }
      });
    }

    // Create a new chat if it doesn't exist
    const newChat = new Chat({
      participants: [req.user.id, userId],
      isActive: true
    });

    await newChat.save();

    res.status(201).json({
      success: true,
      data: {
        chat: newChat,
        messages: []
      }
    });
  } catch (error) {
    console.error('Get or create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating chat'
    });
  }
};

// @desc    Get user chats
// @route   GET /api/chats
// @access  Private
export const getUserChats = async (req: Request, res: Response) => {
  try {
    // Find all chats that the user is part of
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'participants',
        match: { _id: { $ne: req.user.id } },
        select: 'firstName lastName profilePicture role'
      })
      .populate('latestMessage');

    // Enrich with additional profile info based on role
    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        // First check if participants array is not empty
        if (!chat.participants || chat.participants.length === 0) {
          return { ...chat.toObject(), participantInfo: {} };
        }
        
        // Cast participant to any type to safely access properties
        const participant = chat.participants[0] as any;
        let additionalInfo = {};

        if (participant) {
          // Check if role property exists before using it
          if (participant.role === 'doctor') {
            const doctorInfo = await Doctor.findOne({ user: participant._id });
            additionalInfo = {
              specialization: doctorInfo?.specialization,
              isAvailable: doctorInfo?.isAvailableForConsultation
            };
          } else if (participant.role === 'patient') {
            const patientInfo = await Patient.findOne({ user: participant._id });
            additionalInfo = {
              age: patientInfo ? new Date().getFullYear() - new Date(patientInfo.dateOfBirth).getFullYear() : null
            };
          }
        }

        return {
          ...chat.toObject(),
          participantInfo: additionalInfo
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedChats.length,
      data: enrichedChats
    });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching chats'
    });
  }
};

// @desc    Get chat by ID with messages
// @route   GET /api/chats/:id
// @access  Private
export const getChatById = async (req: Request, res: Response) => {
  try {
    // Find chat
    const chat = await Chat.findById(req.params.id)
      .populate({
        path: 'participants',
        select: 'firstName lastName profilePicture role'
      });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is part of the chat
    if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    // Get messages for the chat
    const messages = await Message.find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .populate('sender', 'firstName lastName profilePicture');

    // Mark all unread messages as read
    await Message.updateMany(
      { 
        chat: chat._id, 
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      { $addToSet: { readBy: req.user.id } }
    );

    res.status(200).json({
      success: true,
      data: {
        chat,
        messages
      }
    });
  } catch (error) {
    console.error('Get chat by ID error:', error);

    // Check if error is due to invalid ObjectId
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching chat'
    });
  }
};

// @desc    Send message
// @route   POST /api/chats/:id/messages
// @access  Private
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    // Validate content
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Find chat
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is part of the chat
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    // Create new message
    const newMessage = new Message({
      chat: chat._id,
      sender: req.user.id,
      content,
      readBy: [req.user.id]
    });

    await newMessage.save();

    // Update chat with latest message
    chat.latestMessage = newMessage._id;
    await chat.save();

    // Populate sender info
    await newMessage.populate('sender', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/chats/unread
// @access  Private
export const getUnreadMessageCount = async (req: Request, res: Response) => {
  try {
    // Find all chats that the user is part of
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    });

    // Get count of unread messages for each chat
    const unreadCounts = await Promise.all(
      chats.map(async (chat) => {
        const count = await Message.countDocuments({
          chat: chat._id,
          sender: { $ne: req.user.id },
          readBy: { $ne: req.user.id }
        });

        return {
          chatId: chat._id,
          unreadCount: count
        };
      })
    );

    // Calculate total unread messages
    const totalUnread = unreadCounts.reduce((total, chat) => total + chat.unreadCount, 0);

    res.status(200).json({
      success: true,
      data: {
        total: totalUnread,
        chats: unreadCounts
      }
    });
  } catch (error) {
    console.error('Get unread message count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching unread messages'
    });
  }
}; 