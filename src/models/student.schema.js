import mongoose from 'mongoose';
import { userSchema } from './user.schema.js';

const studentSchema = new mongoose.Schema({
    user: userSchema,
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course"
        }
    ],
    
});

const Student = mongoose.model('student', studentSchema);

export default Student;