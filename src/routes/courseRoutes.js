import express from 'express';
import { 
    createCourse,
    getCoursesByUserId,
    updateCourse,
    getCourseToUpdate,
    getCourseById,
    deleteModule,
} from '../controllers/courseController.js'; // Nhập các controller

const router = express.Router();

// Lấy thông tin các khóa học theo ID người dùng
router.get('/', getCoursesByUserId);

// // Tạo khóa học mới
router.post('/', createCourse);


router.patch('/:courseId', updateCourse);

router.get('/updateview/:courseId', getCourseToUpdate);



// // Lấy thông tin một khóa học theo ID khóa học
router.get('/:courseId', getCourseById);

// router.post('/lessons/:moduleId', upload.single('file'), uploadFile);

// router.delete('/lessons/:lessonId', deleteLesson);

// router.post('/modules/:courseId', createModule);

router.delete('/modules/:moduleId', deleteModule);

router.get('/students/:courseId', getCourseStudents);

router.post('/quizzes/:courseId', createQuiz);

router.get('/quizzes/:courseId', getAllQuizzes)




export default router;
