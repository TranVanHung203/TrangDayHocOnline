import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
    name: String,
    number: Number,
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lesson'
    }]
});

const Module = mongoose.model('module', moduleSchema);

export default Module;