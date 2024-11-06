import express from 'express';
import {
    addQuestionWithAnswersToQuiz,
    deleteQuiz,
    deleteQuestion,
    getQuizProgress
} from '../controllers/quizController.js';


const router = express.Router();



router.post('/questions/answers/:quizId', addQuestionWithAnswersToQuiz);


router.delete('/:quizId', deleteQuiz);


router.delete('/questions/:questionId', deleteQuestion)


router.get('/progress/:quizId', getQuizProgress);



export default router;
