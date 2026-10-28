import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middlewares/auth';
import { createUser, getUserByPhone, verifyPassword, getUserById, updateUserProfile, searchUsers, setUserOnlineStatus } from '../models/user';
import { generateToken } from '../utils/jwt';

export const authRouter = Router();

// Sign up
authRouter.post('/signup', (req, res) => {
  try {
    const { phoneNumber, username, password } = req.body;

    if (!phoneNumber || !username || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const existingUser = getUserByPhone(phoneNumber);
    if (existingUser) {
      res.status(400).json({ error: 'Phone number already registered' });
      return;
    }

    const user = createUser(phoneNumber, username, password);
    if (!user) {
      res.status(500).json({ error: 'Failed to create user' });
      return;
    }

    const token = generateToken(user.id, user.phone_number, user.username);

    res.json({
      token,
      user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
authRouter.post('/login', (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = verifyPassword(phoneNumber, password);
    if (!result || !result.valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(result.user.id, result.user.phone_number, result.user.username);

    res.json({
      token,
      user: result.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
authRouter.get('/me', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = getUserById(req.userId!);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
authRouter.put('/profile', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { username, status, profilePicture } = req.body;

    const updates: any = {};
    if (username) updates.username = username;
    if (status) updates.status = status;
    if (profilePicture) updates.profile_picture = profilePicture;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No updates provided' });
      return;
    }

    const user = updateUserProfile(req.userId!, updates);
    if (!user) {
      res.status(500).json({ error: 'Failed to update profile' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users
authRouter.get('/search', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Missing search query' });
      return;
    }

    const users = searchUsers(q, 20);
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by phone
authRouter.get('/user/:phoneNumber', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { phoneNumber } = req.params;
    const user = getUserByPhone(phoneNumber);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
