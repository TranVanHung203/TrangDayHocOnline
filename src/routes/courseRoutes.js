import express from 'express';
import upload from '../middlewares/upload.js';
import {
    createCourse,
    getCoursesByUserId,
    updateCourse,
    getCourseById,
    deleteModule,
    deleteLesson,
    createModule,
    createLesson,
    getCourseStudents,
    createQuiz,
    getAllQuizzes,
    updateModule,
    getQuizzesForStudent
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

router.delete('/lessons/:lessonId', deleteLesson);



// // Lấy thông tin một khóa học theo ID khóa học
router.get('/:courseId', getCourseById);//rồi


router.post('/modules/:courseId', createModule);//rồi
router.delete('/modules/:moduleId', deleteModule);//rồi


router.patch('/modules/:moduleId', updateModule);

router.post('/lessons/:moduleId', upload.single('file'), createLesson);//rồi

router.delete('/lessons/:lessonId', deleteLesson);//rồi



router.get('/students/:courseId', getCourseStudents);//rồi

router.post('/quizzes/:courseId', createQuiz);

router.get('/quizzes/:courseId', getAllQuizzes)//không biết có sài hay k

router.get('/:courseId/progress', getQuizzesForStudent)




export default router;
