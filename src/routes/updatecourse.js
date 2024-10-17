import express from 'express';
import { 
    getCourseByCode,editCourse
} from '../controllers/khoaHocController.js'; // Nhập các controller // Giả sử bạn đã viết hàm editCourse ở controller

const router = express.Router();

// Route cập nhật khóa học theo maKhoaHoc
router.get('/load-course/:courseCode', getCourseByCode);

router.put('/load-course/:courseCode', editCourse);
// Export router
export default router;
