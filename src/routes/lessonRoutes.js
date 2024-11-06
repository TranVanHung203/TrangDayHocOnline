import express from 'express';
import { getLesson, downloadLessonFile } from '../controllers/lessonController.js';

const router = express.Router();

router.get('/:lessonId', getLesson); // Lấy thông tin bài học

router.get('/download/:lessonId', downloadLessonFile); // Download file bài học

export default router;