import express from 'express';
import {
    getInfoQuiz,
    startQuiz,
    submitQuiz,
   
} from '../controllers/quizzController.js';

const router = express.Router();

router.get('/:quizId', getInfoQuiz);

// // Route cho việc bắt đầu làm bài kiểm tra
router.get('/start/:quizId', startQuiz);


// // Route cho việc nộp bài kiểm tra (có thể là nộp thủ công hoặc tự động)
router.post('/submit/:quizId', submitQuiz);



export default router;
