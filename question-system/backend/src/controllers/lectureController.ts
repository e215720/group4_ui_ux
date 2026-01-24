import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

export async function getLectures(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');

  try {
    const lectures = await prisma.lecture.findMany({
      include: {
        teacher: {
          select: { id: true, name: true, role: true },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ lectures });
  } catch (error) {
    console.error('Get lectures error:', error);
    res.status(500).json({ error: '講義の取得に失敗しました' });
  }
}

export async function getLecture(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { id } = req.params;

  try {
    const lecture = await prisma.lecture.findUnique({
      where: { id: parseInt(id) },
      include: {
        teacher: {
          select: { id: true, name: true, role: true },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!lecture) {
      res.status(404).json({ error: '講義が見つかりません' });
      return;
    }

    res.json({ lecture });
  } catch (error) {
    console.error('Get lecture error:', error);
    res.status(500).json({ error: '講義の取得に失敗しました' });
  }
}

export async function createLecture(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { name, description } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  if (userRole !== 'TEACHER') {
    res.status(403).json({ error: '教師のみが講義を作成できます' });
    return;
  }

  if (!name) {
    res.status(400).json({ error: '講義名は必須です' });
    return;
  }

  try {
    const lecture = await prisma.lecture.create({
      data: {
        name,
        description: description || null,
        teacherId: userId,
      },
      include: {
        teacher: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.status(201).json({ lecture });
  } catch (error) {
    console.error('Create lecture error:', error);
    res.status(500).json({ error: '講義の作成に失敗しました' });
  }
}

export async function deleteLecture(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  if (userRole !== 'TEACHER') {
    res.status(403).json({ error: '教師のみが講義を削除できます' });
    return;
  }

  try {
    const lecture = await prisma.lecture.findUnique({
      where: { id: parseInt(id) },
    });

    if (!lecture) {
      res.status(404).json({ error: '講義が見つかりません' });
      return;
    }

    if (lecture.teacherId !== userId) {
      res.status(403).json({ error: '自分の講義のみ削除できます' });
      return;
    }

    await prisma.lecture.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: '講義を削除しました' });
  } catch (error) {
    console.error('Delete lecture error:', error);
    res.status(500).json({ error: '講義の削除に失敗しました' });
  }
}
