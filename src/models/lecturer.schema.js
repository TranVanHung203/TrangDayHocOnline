import mongoose from 'mongoose';
import { userSchema } from './user.schema';

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