import mongoose from 'mongoose';

const ThongBaoSchema = new mongoose.Schema({
  maSinhVien: { type: String, ref: 'Student', required: true },  // Mã sinh viên chuyển từ ObjectId sang String
  maKhoaHoc: { type: String, ref: 'Course', required: true },  // Mã khóa học chuyển từ ObjectId sang String
  noiDung: { type: String, required: true },  // Nội dung thông báo
  ngayGui: { type: Date, required: true }  // Ngày gửi thông báo
}, { timestamps: true });

const ThongBao = mongoose.model('Notification', ThongBaoSchema);
export default ThongBao;
