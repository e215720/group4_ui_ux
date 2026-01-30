import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

export async function getQuestions(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const userRole = req.user?.role;
  const lectureId = req.query.lectureId ? parseInt(req.query.lectureId as string) : undefined;
  const tagIds = req.query.tags
    ? (req.query.tags as string).split(',').map((id) => parseInt(id))
    : undefined;
  const resolvedFilter = req.query.resolved as string | undefined;

  try {
    const whereClause: {
      lectureId?: number;
      tags?: { some: { id: { in: number[] } } };
      resolved?: boolean;
    } = {};

    if (lectureId) {
      whereClause.lectureId = lectureId;
    }

    if (tagIds && tagIds.length > 0) {
      whereClause.tags = { some: { id: { in: tagIds } } };
    }

    if (resolvedFilter === 'true') {
      whereClause.resolved = true;
    } else if (resolvedFilter === 'false') {
      whereClause.resolved = false;
    }

    const questions = await prisma.question.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        author: {
          select: { id: true, name: true, role: true, nickname: true, showNickname: true },
        },
        lecture: {
          select: { id: true, name: true },
        },
        tags: {
          select: { id: true, name: true, lectureId: true },
        },
        images: {
          select: { id: true, filename: true, path: true },
        },
        answers: {
          include: {
            author: {
              select: { id: true, name: true, role: true, nickname: true, showNickname: true },
            },
            images: {
              select: { id: true, filename: true, path: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Helper function to get display name for student users (for answers, use user's setting)
    const getAnswerDisplayName = (author: { nickname: string | null; showNickname: boolean }) => {
      if (author.showNickname && author.nickname) {
        return author.nickname;
      }
      return '匿名';
    };

    // Helper function to get display name for question author (use question's showNickname setting)
    const getQuestionDisplayName = (questionShowNickname: boolean, authorNickname: string | null) => {
      if (questionShowNickname && authorNickname) {
        return authorNickname;
      }
      return '匿名';
    };

    // If user is a student, anonymize student author names (but show teacher names)
    const processedQuestions = questions.map((question) => ({
      ...question,
      author: userRole === 'TEACHER'
        ? question.author
        : { id: question.author.id, name: getQuestionDisplayName(question.showNickname, question.author.nickname), role: question.author.role },
      answers: question.answers.map((answer) => ({
        ...answer,
        // Teachers are always shown with their real name, students are anonymized or show nickname
        author: userRole === 'TEACHER' || answer.author.role === 'TEACHER'
          ? answer.author
          : { id: answer.author.id, name: getAnswerDisplayName(answer.author), role: answer.author.role },
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
          select: { id: true, name: true, role: true, nickname: true, showNickname: true },
        },
        lecture: {
          select: { id: true, name: true },
        },
        tags: {
          select: { id: true, name: true, lectureId: true },
        },
        images: {
          select: { id: true, filename: true, path: true },
        },
        answers: {
          include: {
            author: {
              select: { id: true, name: true, role: true, nickname: true, showNickname: true },
            },
            images: {
              select: { id: true, filename: true, path: true },
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

    // Helper function to get display name for student users (for answers, use user's setting)
    const getAnswerDisplayName = (author: { nickname: string | null; showNickname: boolean }) => {
      if (author.showNickname && author.nickname) {
        return author.nickname;
      }
      return '匿名';
    };

    // Helper function to get display name for question author (use question's showNickname setting)
    const getQuestionDisplayName = (questionShowNickname: boolean, authorNickname: string | null) => {
      if (questionShowNickname && authorNickname) {
        return authorNickname;
      }
      return '匿名';
    };

    // If user is a student, anonymize student author names (but show teacher names)
    const processedQuestion = {
      ...question,
      author: userRole === 'TEACHER'
        ? question.author
        : { id: question.author.id, name: getQuestionDisplayName(question.showNickname, question.author.nickname), role: question.author.role },
      answers: question.answers.map((answer) => ({
        ...answer,
        // Teachers are always shown with their real name, students are anonymized or show nickname
        author: userRole === 'TEACHER' || answer.author.role === 'TEACHER'
          ? answer.author
          : { id: answer.author.id, name: getAnswerDisplayName(answer.author), role: answer.author.role },
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
  const { title, content, lectureId, tagIds, images, showNickname } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  if (!title || !content) {
    res.status(400).json({ error: 'タイトルと内容は必須です' });
    return;
  }

  if (!lectureId) {
    res.status(400).json({ error: '講義の選択は必須です' });
    return;
  }

  try {
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
    });

    if (!lecture) {
      res.status(404).json({ error: '講義が見つかりません' });
      return;
    }

    const question = await prisma.question.create({
      data: {
        title,
        content,
        authorId: userId,
        lectureId,
        showNickname: showNickname || false,
        ...(tagIds && tagIds.length > 0
          ? { tags: { connect: tagIds.map((id: number) => ({ id })) } }
          : {}),
        ...(images && images.length > 0
          ? {
              images: {
                create: images.map((img: { filename: string; path: string }) => ({
                  filename: img.filename,
                  path: img.path,
                })),
              },
            }
          : {}),
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
        lecture: {
          select: { id: true, name: true },
        },
        tags: {
          select: { id: true, name: true, lectureId: true },
        },
        images: {
          select: { id: true, filename: true, path: true },
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

export async function unresolveQuestion(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { id } = req.params;

  try {
    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: { resolved: false },
    });

    res.json({ question });
  } catch (error) {
    console.error('Unresolve question error:', error);
    res.status(500).json({ error: '質問の更新に失敗しました' });
  }
}

export async function addAnswer(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { id } = req.params;
  const { content, images } = req.body;
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
        ...(images && images.length > 0
          ? {
              images: {
                create: images.map((img: { filename: string; path: string }) => ({
                  filename: img.filename,
                  path: img.path,
                })),
              },
            }
          : {}),
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
        images: {
          select: { id: true, filename: true, path: true },
        },
      },
    });

    res.status(201).json({ answer });
  } catch (error) {
    console.error('Add answer error:', error);
    res.status(500).json({ error: '回答の追加に失敗しました' });
  }
}

export async function deleteQuestion(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: '認証が必要です' });
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

    if (question.authorId !== userId) {
      res.status(403).json({ error: '削除権限がありません' });
      return;
    }

    await prisma.question.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: '質問を削除しました' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: '質問の削除に失敗しました' });
  }
}

export async function updateQuestionTags(req: AuthRequest, res: Response): Promise<void> {
  const prisma: PrismaClient = req.app.get('prisma');
  const { id } = req.params;
  const { tagIds } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: '認証が必要です' });
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

    if (question.authorId !== userId) {
      res.status(403).json({ error: 'タグの編集権限がありません' });
      return;
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: parseInt(id) },
      data: {
        tags: {
          set: tagIds ? tagIds.map((tagId: number) => ({ id: tagId })) : [],
        },
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
        lecture: {
          select: { id: true, name: true },
        },
        tags: {
          select: { id: true, name: true, lectureId: true },
        },
        images: {
          select: { id: true, filename: true, path: true },
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

    res.json({ question: updatedQuestion });
  } catch (error) {
    console.error('Update question tags error:', error);
    res.status(500).json({ error: 'タグの更新に失敗しました' });
  }
}
