import express from 'express';
import { getCourseByCode, getAllCourses } from '../controllers/khoaHocController.js';
import { uploadFile } from '../controllers/khoaHocController.js';
import upload from '../middlewares/upload.js';


const router = express.Router();

// Định nghĩa route để lấy khóa học theo mã khóa học
router.get('/course/code/:code', getCourseByCode);

router.get('/courses', getAllCourses);

// Route để upload tài liệu cho một khóa học
router.post('/course/upload/:maKhoaHoc', upload.single('file'), uploadFile);

export default router;  