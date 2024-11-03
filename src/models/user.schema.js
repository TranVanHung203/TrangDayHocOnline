import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String
});

const User = mongoose.model('user', userSchema);

// Export mặc định
export default User;
// Hoặc export cả schema
export { userSchema };