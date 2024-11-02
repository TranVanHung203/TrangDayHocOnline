import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
    name: String,
    number: Number,
    lessons: []
});

const Module = mongoose.model('module', moduleSchema);

export default Module;