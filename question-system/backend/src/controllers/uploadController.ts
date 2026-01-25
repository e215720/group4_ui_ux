import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('許可されていないファイル形式です'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export async function uploadImage(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: 'ファイルがアップロードされていません' });
    return;
  }

  const file = req.file;
  const imageUrl = `/uploads/${file.filename}`;

  res.status(201).json({
    image: {
      filename: file.filename,
      path: imageUrl,
      originalName: file.originalname,
    },
  });
}

export async function deleteImage(req: AuthRequest, res: Response): Promise<void> {
  const { filename } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: '画像を削除しました' });
  } else {
    res.status(404).json({ error: '画像が見つかりません' });
  }
}
