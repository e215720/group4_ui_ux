import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken, AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { email, password, name, role, nickname, showNickname } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'メール、パスワード、名前は必須です' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'このメールアドレスは既に使用されています' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isStudent = role !== 'TEACHER';
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
        ...(isStudent ? { nickname: nickname || null, showNickname: showNickname || false } : {}),
      },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ...(isStudent ? { nickname: user.nickname, showNickname: user.showNickname } : {}),
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'アカウント作成に失敗しました' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'メールとパスワードは必須です' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    const isStudent = user.role === 'STUDENT';
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ...(isStudent ? { nickname: user.nickname, showNickname: user.showNickname } : {}),
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'ログインに失敗しました' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');

  if (!req.user) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, nickname: true, showNickname: true },
    });

    if (!user) {
      res.status(404).json({ error: 'ユーザーが見つかりません' });
      return;
    }

    const isStudent = user.role === 'STUDENT';
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ...(isStudent ? { nickname: user.nickname, showNickname: user.showNickname } : {}),
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'ユーザー情報の取得に失敗しました' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');

  if (!req.user) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  const { nickname, showNickname } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!existingUser) {
      res.status(404).json({ error: 'ユーザーが見つかりません' });
      return;
    }

    if (existingUser.role !== 'STUDENT') {
      res.status(403).json({ error: '教師はプロフィール設定を変更できません' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        nickname: nickname !== undefined ? nickname || null : existingUser.nickname,
        showNickname: showNickname !== undefined ? showNickname : existingUser.showNickname,
      },
      select: { id: true, email: true, name: true, role: true, nickname: true, showNickname: true },
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        nickname: user.nickname,
        showNickname: user.showNickname,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'プロフィールの更新に失敗しました' });
  }
}
