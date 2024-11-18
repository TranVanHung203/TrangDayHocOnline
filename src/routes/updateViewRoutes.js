import express from 'express';
import upload from '../middlewares/upload.js';
import { 
    createCourse,
    getCoursesByUserId,
    updateCourse,
    getCourseToUpdate,
    getCourseById,
    deleteModule,
    deleteLesson,
    createModule,
    createLesson,
    getCourseStudents,
    createQuiz,
    getAllQuizzes,
} from '../controllers/courseController.js'; // Nhập các controller

import { authToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.all("*", authToken);
router.get('/:courseId', getCourseToUpdate);

export default router;
