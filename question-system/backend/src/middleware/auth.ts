import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'トークンが無効です' });
  }
}

export function generateToken(user: { id: number; email: string; role: string }): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}
