import express from 'express';
import cron from 'node-cron';
import axios from 'axios';
import Course from '../models/course.schema.js';
import {
    
    getTimelineTest,
    sendReminder,
} from '../controllers/notifyController.js';

import { authToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.all("*", authToken);

router.get('/timeline', getTimelineTest);

//http://localhost:5000/notify/send-reminder/67285d33a6ab2a9f4a03d9be?days=3
router.get('/send-reminder/:courseId', sendReminder);



// Cron job để gửi thông báo tự động
cron.schedule('0 6 * * *', async ()  => {
    console.log('Chạy cron job để gửi thông báo tự động...');

    try {
        // Lấy tất cả các khóa học từ cơ sở dữ liệu
        const courses = await Course.find().lean(); // Sử dụng .lean() để tối ưu hóa

        // Lặp qua từng khóa học và gọi sendReminder
        for (const course of courses) {
            const courseId = course._id; // Lấy ID khóa học
            const days = 2; // Bạn có thể tùy chỉnh số ngày

            // Gửi yêu cầu GET đến route với courseId và days
            await axios.get(`http://localhost:5000/notify/send-reminder/${courseId}?days=${days}`);
            console.log(`Đã gửi thông báo cho khóa học ID: ${courseId}`);
        }
    } catch (error) {
        console.error('Lỗi khi gọi sendReminder từ cron job:', error.message);
    }
});



export default router;
