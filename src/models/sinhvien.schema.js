import mongoose from 'mongoose';

const TienDoSchema = new mongoose.Schema({
  soBaiGiangDaHoanThanh: { type: Number, required: true },
  soBaiTapDaHoanThanh: { type: Number, required: true },
  tongTienDo: { type: Number, required: true }
});

const KhoaHocSchema = new mongoose.Schema({
  maKhoaHoc: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  ngayDangKy: { type: Date, required: true },
  tienDo: { type: TienDoSchema, required: true }
});

const SinhVienSchema = new mongoose.Schema({
  hoTen: { type: String, required: true },
  ngaySinh: { type: Date, required: true },
  soKhoaHocDaThamGia: { type: Number, required: true },
  maNguoiDung: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  khoaHocs: [KhoaHocSchema]
}, { timestamps: true });

const SinhVien = mongoose.model('Student', SinhVienSchema);
export default SinhVien;
