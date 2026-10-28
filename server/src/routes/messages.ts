import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middlewares/auth';
import { userActionLimiter } from '../middlewares/rateLimiter';
import {
  getDirectMessages,
  updateMessageStatus,
  editMessage,
  deleteMessage,
  searchMessages,
} from '../models/message';

export const messageRouter = Router();

// Get direct messages between two users
messageRouter.post('/direct', authMiddleware, userActionLimiter, (req: AuthRequest, res) => {
  try {
    const { userId, limit = 50, offset = 0 } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const messages = getDirectMessages(
      req.userId!,
      userId,
      Math.min(parseInt(limit as any) || 50, 100), // Cap at 100
      Math.max(parseInt(offset as any) || 0, 0) // Prevent negative offset
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update message status
messageRouter.put('/:messageId/status', authMiddleware, userActionLimiter, (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    if (!status || !['sent', 'delivered', 'read'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const message = updateMessageStatus(messageId, status);

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    res.json(message);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Edit message
messageRouter.put('/:messageId', authMiddleware, userActionLimiter, (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const message = editMessage(messageId, content);

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    res.json(message);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete message
messageRouter.delete('/:messageId', authMiddleware, userActionLimiter, (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;

    const success = deleteMessage(messageId);

    if (!success) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search messages
messageRouter.post('/search', authMiddleware, userActionLimiter, (req: AuthRequest, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Missing search query' });
      return;
    }

    const messages = searchMessages(req.userId!, query);

    res.json(messages);
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
