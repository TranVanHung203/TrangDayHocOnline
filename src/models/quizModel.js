import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    name: String,
    number: Number,
    course_order: Number,
    min_pass_score: Number,
    is_pass_required: Boolean,
    start_deadline: Date,
    end_deadline: Date,
    quiz_questions: [],
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    score_achieved: [],
    attempt_datetime: []
});

const Quiz = mongoose.model('quiz', quizSchemaSchema);

export default Quiz;