import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    reset_token: String,
    verify_token: String,
    is_verify_email: Boolean
});

const User = mongoose.model('User', userSchema);

export default User;
