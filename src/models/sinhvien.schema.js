import mongoose from 'mongoose';

const TienDoSchema = new mongoose.Schema({
  soBaiGiangDaHoanThanh: { type: Number, required: true },
  soBaiTapDaHoanThanh: { type: Number, required: true },
  tongTienDo: { type: Number, required: true }
});

const KhoaHocSchema = new mongoose.Schema({
  maKhoaHoc: { type: String, ref: 'Course', required: true },  // Mã khóa học chuyển thành chuỗi
  ngayDangKy: { type: Date, required: true },
  tienDo: { type: TienDoSchema, required: true }
});

const SinhVienSchema = new mongoose.Schema({
  hoTen: { type: String, required: true },
  ngaySinh: { type: Date, required: true },
  soKhoaHocDaThamGia: { type: Number, required: true },
  maNguoiDung: { type: String, ref: 'User', required: true },  // Mã người dùng chuyển thành chuỗi
  khoaHocs: [KhoaHocSchema]
}, { timestamps: true });

const SinhVien = mongoose.model('Student', SinhVienSchema);
export default SinhVien;
