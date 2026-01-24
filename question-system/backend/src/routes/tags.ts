import { Router } from 'express';
import { getTags, createTag } from '../controllers/tagController';
import { authenticateToken } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.get('/', authenticateToken, getTags);
router.post('/', authenticateToken, createTag);

export default router;
