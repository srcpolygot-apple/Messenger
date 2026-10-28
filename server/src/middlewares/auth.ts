import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
  phone?: string;
  username?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.phone = payload.phone;
    req.username = payload.username;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const payload = verifyToken(token);
      req.userId = payload.userId;
      req.phone = payload.phone;
      req.username = payload.username;
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
}
