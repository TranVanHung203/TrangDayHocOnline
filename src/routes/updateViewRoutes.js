import express from 'express';
import upload from '../middlewares/upload.js';
import { 
    getCourseToUpdate,
 
} from '../controllers/courseController.js'; // Nhập các controller

import { authToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.all("*", authToken);
router.get('/:courseId', getCourseToUpdate);

export default router;
