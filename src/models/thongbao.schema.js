import mongoose from 'mongoose';

const ThongBaoSchema = new mongoose.Schema({
  maSinhVien: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  maKhoaHoc: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  noiDung: { type: String, required: true },
  ngayGui: { type: Date, required: true }
}, { timestamps: true });

const ThongBao = mongoose.model('Notification', ThongBaoSchema);
export default ThongBao;
