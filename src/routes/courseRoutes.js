import express from 'express';
import { 
    createCourse
} from '../controllers/khoaHocController.js'; // Nhập các controller

const router = express.Router();

router.post('/create', createCourse);

export default router;
