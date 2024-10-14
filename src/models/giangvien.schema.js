import mongoose from 'mongoose';

const GiangVienSchema = new mongoose.Schema({
  hoTen: { type: String, required: true },
  gioiThieu: { type: String, required: true },
  maNguoiDung: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const GiangVien = mongoose.model('Teacher', GiangVienSchema);
export default GiangVien;
