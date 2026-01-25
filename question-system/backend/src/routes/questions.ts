import { Router } from 'express';
import {
  getQuestions,
  getQuestion,
  createQuestion,
  resolveQuestion,
  addAnswer,
  updateQuestionTags,
} from '../controllers/questionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getQuestions);
router.post('/', authenticateToken, createQuestion);
router.get('/:id', authenticateToken, getQuestion);
router.put('/:id/resolve', authenticateToken, resolveQuestion);
router.put('/:id/tags', authenticateToken, updateQuestionTags);
router.post('/:id/answers', authenticateToken, addAnswer);

export default router;
