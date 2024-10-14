import mongoose from 'mongoose';

const CauHoiSchema = new mongoose.Schema({
  maCauHoi: { type: mongoose.Schema.Types.ObjectId, required: true },
  noiDungCauHoi: { type: String, required: true },
  dapAn: { type: String, required: true },
  dapanChon: [{
    maAnswer: { type: mongoose.Schema.Types.ObjectId, required: true },
    maSinhVien: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    dapAnChon: { type: String, required: true },
    dungSai: { type: Boolean, required: true }
  }]
});

const QuizSchema = new mongoose.Schema({
  maQuiz: { type: mongoose.Schema.Types.ObjectId, required: true },
  tenQuiz: { type: String, required: true },
  ngayBatDau: { type: Date, required: true },
  ngayKetThuc: { type: Date, required: true },
  thoiGian: { type: Number, required: true },
  xemLaiBai: { type: Boolean, required: true },
  cauHoi: [CauHoiSchema]
});

const TaiLieuSchema = new mongoose.Schema({
  maTaiLieu: { type: mongoose.Schema.Types.ObjectId, required: true },
  tenTaiLieu: { type: String, required: true },
  loaiTaiLieu: { type: String, required: true },
  duongDan: { type: String, required: true }
});

const KhoaHocSchema = new mongoose.Schema({
  tenKhoaHoc: { type: String, required: true },
  moTa: { type: String, required: true },
  ngayBatDau: { type: Date, required: true },
  ngayKetThuc: { type: Date, required: true },
  maGiangVien: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  taiLieu: [TaiLieuSchema],
  quizzes: [QuizSchema]
}, { timestamps: true });

const KhoaHoc = mongoose.model('Course', KhoaHocSchema);
export default KhoaHoc;
