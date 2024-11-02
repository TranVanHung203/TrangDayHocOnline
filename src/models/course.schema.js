import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    name: String,
    description: String,
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
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