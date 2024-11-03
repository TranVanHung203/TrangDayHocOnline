import mongoose from 'mongoose';

const lecturerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course"
        }
    ]
});

const Lecturer = mongoose.model('lecturer', lecturerSchema);

export default Lecturer;
