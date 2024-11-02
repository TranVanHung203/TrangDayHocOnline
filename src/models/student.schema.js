import mongoose from 'mongoose';
import { userSchema } from './user.schema';

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
    quizzes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "quiz"
        }
    ],
});

const Student = mongoose.model('student', studentSchema);

export default Student;