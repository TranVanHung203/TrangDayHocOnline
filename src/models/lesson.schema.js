import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
    name: String,
    number: Number,
    document_url: String,
    lesson_details: String,
    type: String,

});

const Lesson = mongoose.model('lesson', lessonSchema);

export default Lesson;