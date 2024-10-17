import mongoose from 'mongoose';

const GiangVienSchema = new mongoose.Schema({
  hoTen: { type: String, required: true },  // Tên của giảng viên
  gioiThieu: { type: String, required: true },  // Giới thiệu về giảng viên
  maNguoiDung: { type: String, required: true }  // Mã người dùng (chuỗi thay vì ObjectId)
}, { timestamps: true });  // Tự động thêm createdAt và updatedAt

const GiangVien = mongoose.model('Teacher', GiangVienSchema);
export default GiangVien;
