import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
    name: String,
    number: Number,
    video_url: String,
    lesson_details: String,
    course_order: Number,
    start_deadline: Date,
    end_deadline: Date,
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "student"
        }
    ],
    completed_datetime: [],
});

const Lesson = mongoose.model('lesson', lessonSchemaSchema);

export default Lesson;