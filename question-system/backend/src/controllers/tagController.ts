import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

export async function getTags(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { lectureId } = req.params;

  try {
    const tags = await prisma.tag.findMany({
      where: { lectureId: parseInt(lectureId) },
      orderBy: { name: 'asc' },
    });

    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'タグの取得に失敗しました' });
  }
}

export async function createTag(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { lectureId } = req.params;
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'タグ名は必須です' });
    return;
  }

  const trimmedName = name.trim();

  try {
    const lecture = await prisma.lecture.findUnique({
      where: { id: parseInt(lectureId) },
    });

    if (!lecture) {
      res.status(404).json({ error: '講義が見つかりません' });
      return;
    }

    const existingTag = await prisma.tag.findUnique({
      where: {
        name_lectureId: {
          name: trimmedName,
          lectureId: parseInt(lectureId),
        },
      },
    });

    if (existingTag) {
      res.json({ tag: existingTag });
      return;
    }

    const tag = await prisma.tag.create({
      data: {
        name: trimmedName,
        lectureId: parseInt(lectureId),
      },
    });

    res.status(201).json({ tag });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'タグの作成に失敗しました' });
  }
}
