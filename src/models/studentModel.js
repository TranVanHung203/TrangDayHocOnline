import mongoose from 'mongoose';
import { userSchema } from './userModel';

const studentSchema = new mongoose.Schema({
    user: userSchema,
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course"
        }
    ],
    lessons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "lesson"
        }
    ],
    completed_datetime: [],
    quizzes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "quiz"
        }
    ],
    score_achieved: [],
    attempt_datetime: []
});

const Student = mongoose.model('student', studentSchema);

export default Student;