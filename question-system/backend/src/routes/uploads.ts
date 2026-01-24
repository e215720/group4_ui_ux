import { Router } from 'express';
import { upload, uploadImage, deleteImage } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, upload.single('image'), uploadImage);
router.delete('/:filename', authenticateToken, deleteImage);

export default router;
