import mongoose from 'mongoose';

const CauHoiSchema = new mongoose.Schema({
  maCauHoi: { type: String, required: true },  // Mã câu hỏi chuyển thành chuỗi
  noiDungCauHoi: { type: String, required: true },
  dapAn: { type: String, required: true },
  dapanChon: [{
    maAnswer: { type: String, required: true },  // Mã đáp án chuyển thành chuỗi
    maSinhVien: { type: String, ref: 'Student', required: true },  // Mã sinh viên chuyển thành chuỗi
    dapAnChon: { type: String, required: true },
    dungSai: { type: Boolean, required: true }
  }]
});

const QuizSchema = new mongoose.Schema({
  maQuiz: { type: String, required: true },  // Mã quiz chuyển thành chuỗi
  tenQuiz: { type: String, required: true },
  ngayBatDau: { type: Date, required: true },
  ngayKetThuc: { type: Date, required: true },
  thoiGian: { type: Number, required: true },
  xemLaiBai: { type: Boolean, required: true },
  cauHoi: [CauHoiSchema]
});

const TaiLieuSchema = new mongoose.Schema({
  maTaiLieu: { type: String, required: true },  // Mã tài liệu chuyển thành chuỗi
  tenTaiLieu: { type: String, required: true },
  loaiTaiLieu: { type: String, required: true },
  duongDan: { type: String, required: true }
});

const KhoaHocSchema = new mongoose.Schema({
  maKhoaHoc: { type: String, required: true },  // Mã khóa học chuyển thành chuỗi
  tenKhoaHoc: { type: String, required: true },
  moTa: { type: String, required: true },
  ngayBatDau: { type: Date, required: true },
  ngayKetThuc: { type: Date, required: true },
  maGiangVien: { type: String, required: true },  // Mã giảng viên chuyển thành chuỗi
  taiLieu: [TaiLieuSchema],
  quizzes: [QuizSchema]
}, { timestamps: true });

const KhoaHoc = mongoose.model('Course', KhoaHocSchema);
export default KhoaHoc;
