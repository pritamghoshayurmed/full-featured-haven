import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './user.model';

export interface IMessage extends Document {
  chat: Types.ObjectId | IChat;
  sender: Types.ObjectId | IUser;
  content: string;
  readBy: (Types.ObjectId | IUser)[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IChat extends Document {
  participants: (Types.ObjectId | IUser)[];
  latestMessage?: Types.ObjectId | IMessage;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// AI Chat Interface
export interface IAIChat extends Document {
  user: Types.ObjectId | IUser;
  title: string;
  messages: IAIMessage[];
  summary?: string;
  sharedWithDoctor?: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Chat Schema
const chatSchema = new Schema<IChat>({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  latestMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Message Schema
const messageSchema = new Schema<IMessage>({
  chat: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  readBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, {
  timestamps: true
});

// AI Chat Schema
const aiMessageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const aiChatSchema = new Schema<IAIChat>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [aiMessageSchema],
  summary: String,
  sharedWithDoctor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Chat = mongoose.model<IChat>('Chat', chatSchema);
const Message = mongoose.model<IMessage>('Message', messageSchema);
const AIChat = mongoose.model<IAIChat>('AIChat', aiChatSchema);

export { Chat, Message, AIChat }; 