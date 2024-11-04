import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    name: String,
    number: Number,
    min_pass_score: Number,
    start_deadline: Date,
    end_deadline: Date,
    quiz_questions: [],
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "student"
        }
    ],
    score_achieved: [],
    attempt_datetime: []
});

const Quiz = mongoose.model('quiz', quizSchema);

export default Quiz;