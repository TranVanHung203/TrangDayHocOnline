import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
    question_title: String,
    quiz_answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quiz_answer'
    }]
});

const QuizQuestion = mongoose.model('quiz_question', quizQuestionSchema);

export default QuizQuestion;    