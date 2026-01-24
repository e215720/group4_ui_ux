import { Router } from 'express';
import {
  getLectures,
  getLecture,
  createLecture,
  deleteLecture,
} from '../controllers/lectureController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getLectures);
router.post('/', authenticateToken, createLecture);
router.get('/:id', authenticateToken, getLecture);
router.delete('/:id', authenticateToken, deleteLecture);

export default router;
