import express from 'express';
import { 
  getAllCourses, 
  getCoursesByTeacher,
  createCourse
} from '../controllers/khoaHocController.js'; // Nhập các controller

const router = express.Router();

// Route lấy tất cả khóa học
router.get('/homepage', getAllCourses);

router.post('/create', createCourse);

// Route lấy các khóa học mà giáo viên đã giảng dạy
router.get('/teacher/:teacherId/courses', getCoursesByTeacher);

export default router;
