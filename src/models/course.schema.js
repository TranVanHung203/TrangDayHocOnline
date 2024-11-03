import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    name: String,
    description: String,
    start_day: Date,
    end_day: Date,
    modules: [],
    quiz: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "quiz"
        }
    ]
});

const Course = mongoose.model('course', courseSchema);

export default Course;