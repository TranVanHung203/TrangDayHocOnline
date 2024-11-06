import express from 'express';
import {
    addQuestionWithAnswersToQuiz,
    deleteQuiz,
    deleteQuestion,
    getQuizProgress,
    getInfoQuiz,
    startQuiz,
    submitQuiz,
    updateQuiz,
    updateQuestionandAnswer,
} from '../controllers/quizController.js';


const router = express.Router();



router.post('/questions/answers/:quizId', addQuestionWithAnswersToQuiz);


router.delete('/:quizId', deleteQuiz);


router.delete('/questions/:questionId', deleteQuestion)


router.get('/progress/:quizId', getQuizProgress);

//----------------------------

router.get('/:quizId', getInfoQuiz);

// // Route cho việc bắt đầu làm bài kiểm tra
router.get('/start/:quizId', startQuiz);


// // Route cho việc nộp bài kiểm tra (có thể là nộp thủ công hoặc tự động)
router.post('/submit/:quizId', submitQuiz);

//sửa quiz(sửa tên, sửa thời hạn, điểm min)
router.patch('/:quizId',updateQuiz)

//sửa question(tên)
router.patch('/:quizId/:questionId',updateQuestionandAnswer)


export default router;
