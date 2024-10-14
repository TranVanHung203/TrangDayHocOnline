import mongoose from 'mongoose';

const NguoiDungSchema = new mongoose.Schema({
  tenDangNhap: { type: String, required: true, unique: true },
  matKhau: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  vaiTro: { type: String, enum: ['Teacher', 'Student', 'Admin'], required: true }
}, { timestamps: true });

const NguoiDung = mongoose.model('User', NguoiDungSchema);
export default NguoiDung;
