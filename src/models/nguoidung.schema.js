import mongoose from 'mongoose';

const NguoiDungSchema = new mongoose.Schema({
  maNguoiDung: { type: String, unique: true },  // Mã người dùng (chuỗi), tạo sau khi lưu
  tenDangNhap: { type: String, required: true, unique: true },  // Tên đăng nhập (chuỗi)
  matKhau: { type: String, required: true },  // Mật khẩu (chuỗi)
  email: { type: String, required: true, unique: true },  // Email (chuỗi)
  vaiTro: { type: String, enum: ['Teacher', 'Student', 'Admin'], required: true }  // Vai trò (chuỗi)
}, { timestamps: true });

const NguoiDung = mongoose.model('User', NguoiDungSchema);
export default NguoiDung;
