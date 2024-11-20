import express from 'express';
import { getLesson, downloadLessonFile } from '../controllers/lessonController.js';

import { authToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.all("*", authToken);

router.get('/:lessonId', getLesson); // Lấy thông tin bài học chua biết có sài hay k

router.get('/download/:lessonId', downloadLessonFile); // Download file bài học

export default router;