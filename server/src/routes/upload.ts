import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/upload.controller';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('file'), uploadImage);

export default router;
