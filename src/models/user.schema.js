import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    reset_token: String
});

const User = mongoose.model('User', userSchema);

export default User;
