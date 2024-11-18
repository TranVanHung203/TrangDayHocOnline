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
    updateModule
} from '../controllers/courseController.js'; // Nhập các controller

import { authToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.all("*", authToken);

//http://localhost:5000/courses/?page=1&limit=5
// Lấy thông tin các khóa học theo ID người dùng
router.get('/', getCoursesByUserId);

// // Tạo khóa học mới
router.post('/', createCourse);


router.patch('/:courseId', updateCourse);





// // Lấy thông tin một khóa học theo ID khóa học
router.get('/:courseId', getCourseById);


router.post('/modules/:courseId', createModule);
router.delete('/modules/:moduleId', deleteModule);


router.patch('/modules/:moduleId', updateModule);


router.post('/lessons/:moduleId', upload.single('file'), createLesson);





router.post('/quizzes/:courseId', createQuiz);

router.get('/quizzes/:courseId', getAllQuizzes)




export default router;
