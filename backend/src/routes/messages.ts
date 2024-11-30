import express from 'express';
import {
    sendMessage,
    getMessages,
    updateMessageStatus,
    getConversations,
} from '../controllers/messageController';
import { auth } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(auth);

// Message routes
router.post('/', sendMessage);
router.get('/', getMessages);
router.patch('/:messageId/status', updateMessageStatus);
router.get('/conversations', getConversations);

export default router; 