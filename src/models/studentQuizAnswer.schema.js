import mongoose from 'mongoose';

const studentQuizAnswerSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "quiz",
        required: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "quiz_question",
        required: true
    },
    answer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "quiz_answer",
        required: false
    },
    is_correct: {
        type: Boolean,
        required: true
    },
   
});

const StudentQuizAnswer = mongoose.model('student_quiz_answer', studentQuizAnswerSchema);

export default StudentQuizAnswer;
