import mongoose from 'mongoose';
import { userSchema } from './userModel';

const lecturerSchema = new mongoose.Schema({
    user: userSchema,
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course"
        }
    ]
});

const Lecturer = mongoose.model('lecturer', lecturerSchema);

export default Lecturer;