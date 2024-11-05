import express from 'express';
import upload from '../middlewares/upload.js';
import {
    getCourseById,
    deleteModule,
    deleteLesson,
    createModule,
    createLesson,
    getCourseStudents,
    createQuiz,
    getAllQuizzes,
} from '../controllers/courseController.js'; // Nhập các controller

const router = express.Router();

// Lấy thông tin một khóa học theo ID khóa học
router.get('/:courseId', getCourseById);

router.post('/lessons/:moduleId', upload.single('file'), createLesson);

router.delete('/lessons/:lessonId', deleteLesson);

router.post('/modules/:courseId', createModule);

router.delete('/modules/:moduleId', deleteModule);

router.get('/students/:courseId', getCourseStudents);

router.post('/quizzes/:courseId', createQuiz);

router.get('/quizzes/:courseId', getAllQuizzes)




export default router;
