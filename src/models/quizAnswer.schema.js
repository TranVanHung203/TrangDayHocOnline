import mongoose from 'mongoose';

const quizAnswerSchema = new mongoose.Schema({
    answer_text: String,
    is_correct: Boolean,
});

const QuizAnswer = mongoose.model('quiz_answer', quizAnswerSchema);

export default QuizAnswer;