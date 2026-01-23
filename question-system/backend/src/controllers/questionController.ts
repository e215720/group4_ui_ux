import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

export async function getQuestions(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const userRole = req.user?.role;

  try {
    const questions = await prisma.question.findMany({
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
        answers: {
          include: {
            author: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If user is a student, anonymize author names
    const processedQuestions = questions.map((question) => ({
      ...question,
      author: userRole === 'TEACHER'
        ? question.author
        : { id: question.author.id, name: '匿名', role: question.author.role },
      answers: question.answers.map((answer) => ({
        ...answer,
        author: userRole === 'TEACHER'
          ? answer.author
          : { id: answer.author.id, name: '匿名', role: answer.author.role },
      })),
    }));

    res.json({ questions: processedQuestions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: '質問の取得に失敗しました' });
  }
}

export async function getQuestion(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { id } = req.params;
  const userRole = req.user?.role;

  try {
    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
        answers: {
          include: {
            author: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!question) {
      res.status(404).json({ error: '質問が見つかりません' });
      return;
    }

    // If user is a student, anonymize author names
    const processedQuestion = {
      ...question,
      author: userRole === 'TEACHER'
        ? question.author
        : { id: question.author.id, name: '匿名', role: question.author.role },
      answers: question.answers.map((answer) => ({
        ...answer,
        author: userRole === 'TEACHER'
          ? answer.author
          : { id: answer.author.id, name: '匿名', role: answer.author.role },
      })),
    };

    res.json({ question: processedQuestion });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: '質問の取得に失敗しました' });
  }
}

export async function createQuestion(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { title, content } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  if (!title || !content) {
    res.status(400).json({ error: 'タイトルと内容は必須です' });
    return;
  }

  try {
    const question = await prisma.question.create({
      data: {
        title,
        content,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.status(201).json({ question });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: '質問の作成に失敗しました' });
  }
}

export async function resolveQuestion(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { id } = req.params;

  try {
    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: { resolved: true },
    });

    res.json({ question });
  } catch (error) {
    console.error('Resolve question error:', error);
    res.status(500).json({ error: '質問の更新に失敗しました' });
  }
}

export async function addAnswer(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  if (!content) {
    res.status(400).json({ error: '回答内容は必須です' });
    return;
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
    });

    if (!question) {
      res.status(404).json({ error: '質問が見つかりません' });
      return;
    }

    const answer = await prisma.answer.create({
      data: {
        content,
        authorId: userId,
        questionId: parseInt(id),
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.status(201).json({ answer });
  } catch (error) {
    console.error('Add answer error:', error);
    res.status(500).json({ error: '回答の追加に失敗しました' });
  }
}
