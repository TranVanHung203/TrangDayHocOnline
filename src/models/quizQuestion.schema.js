import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
    question_title: String,
    quiz_answers: []
});

const QuizQuestion = mongoose.model('quiz_question', quizQuestionSchema);

export default QuizQuestion;