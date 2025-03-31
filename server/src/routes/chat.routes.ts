import express from 'express';
import { check } from 'express-validator';
import * as chatController from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all chats for a user
router.get('/', chatController.getUserChats);

// Get unread message count
router.get('/unread', chatController.getUnreadMessageCount);

// Get or create a chat with a user
router.post(
  '/',
  [
    check('userId', 'User ID is required').notEmpty()
  ],
  chatController.getOrCreateChat
);

// Get specific chat by ID
router.get('/:id', chatController.getChatById);

// Send a message in a chat
router.post(
  '/:id/messages',
  [
    check('content', 'Message content is required').notEmpty()
  ],
  chatController.sendMessage
);

export default router; 