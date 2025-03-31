import express from 'express';
import * as aiController from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Chat with AI
router.post('/chat', aiController.chatWithAI);

// Get AI chat history
router.get('/chats', aiController.getAIChats);

// Get single AI chat
router.get('/chats/:id', aiController.getAIChatById);

// Share AI chat with doctor
router.post('/chats/:id/share', aiController.shareAIChatWithDoctor);

// Delete AI chat
router.delete('/chats/:id', aiController.deleteAIChat);

export default router; 