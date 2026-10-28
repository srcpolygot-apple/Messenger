import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';
import { initializeDatabase } from './database';
import { authRouter } from './routes/auth';
import { contactRouter } from './routes/contacts';
import { messageRouter } from './routes/messages';
import { groupRouter } from './routes/groups';
import { generalLimiter } from './middlewares/rateLimiter';
import { createMessage, getMessageById } from './models/message';
import { setUserOnlineStatus } from './models/user';
import { verifyToken } from './utils/jwt';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Initialize database
initializeDatabase();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/contacts', contactRouter);
app.use('/api/messages', messageRouter);
app.use('/api/groups', groupRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io connection
const userSockets = new Map<string, string>(); // userId -> socketId
const userTyping = new Map<string, Set<string>>(); // chatId -> Set<userId>

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Authenticate user
  socket.on('auth', (token: string) => {
    try {
      const payload = verifyToken(token);
      const userId = payload.userId;

      userSockets.set(userId, socket.id);
      socket.data.userId = userId;
      socket.data.username = payload.username;

      // Mark user as online
      setUserOnlineStatus(userId, true);

      // Notify others
      io.emit('user:online', { userId, username: payload.username });

      socket.emit('auth:success', { userId });
      console.log(`User authenticated: ${userId}`);
    } catch (error) {
      socket.emit('auth:error', { error: 'Invalid token' });
      socket.disconnect();
    }
  });

  // Direct message
  socket.on('message:send', (data: {
    receiverId: string;
    content: string;
    messageType?: string;
    mediaUrl?: string;
  }) => {
    try {
      const senderId = socket.data.userId;
      if (!senderId) {
        socket.emit('error', { error: 'Not authenticated' });
        return;
      }

      const message = createMessage(
        senderId,
        data.receiverId,
        data.content,
        data.messageType || 'text',
        data.mediaUrl
      );

      if (!message) {
        socket.emit('error', { error: 'Failed to send message' });
        return;
      }

      // Send to receiver if online
      const receiverSocketId = userSockets.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:receive', message);
      }

      // Send confirmation to sender
      socket.emit('message:sent', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { error: 'Internal server error' });
    }
  });

  // Typing indicator
  socket.on('typing:start', (data: { chatId: string }) => {
    const userId = socket.data.userId;
    if (!userId) return;

    if (!userTyping.has(data.chatId)) {
      userTyping.set(data.chatId, new Set());
    }

    userTyping.get(data.chatId)!.add(userId);

    io.emit('typing:users', {
      chatId: data.chatId,
      users: Array.from(userTyping.get(data.chatId) || []),
    });
  });

  socket.on('typing:stop', (data: { chatId: string }) => {
    const userId = socket.data.userId;
    if (!userId) return;

    if (userTyping.has(data.chatId)) {
      userTyping.get(data.chatId)!.delete(userId);

      if (userTyping.get(data.chatId)!.size === 0) {
        userTyping.delete(data.chatId);
      }

      io.emit('typing:users', {
        chatId: data.chatId,
        users: Array.from(userTyping.get(data.chatId) || []),
      });
    }
  });

  // Message status update
  socket.on('message:status', (data: { messageId: string; status: string }) => {
    try {
      const message = getMessageById(data.messageId);
      if (!message) return;

      // Broadcast status to both users
      const senderSocketId = userSockets.get(message.sender_id);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message:status', { messageId: data.messageId, status: data.status });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      userSockets.delete(userId);
      setUserOnlineStatus(userId, false);
      io.emit('user:offline', { userId });
      console.log(`User disconnected: ${userId}`);
    }
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
