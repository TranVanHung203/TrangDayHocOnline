import mongoose from 'mongoose';
import DatabaseConfig from './src/config/databaseConfig.js';
import GiangVien from './src/models/giangvien.schema.js';
import SinhVien from './src/models/sinhvien.schema.js';
import NguoiDung from './src/models/nguoidung.schema.js';
import KhoaHoc from './src/models/khoahoc.schema.js';
import ThongBao from './src/models/thongbao.schema.js';

const seedData = async () => {
  try {
    const dbConfig = new DatabaseConfig(); // Tạo instance của DatabaseConfig
    await dbConfig.connect(); // Gọi phương thức connect() để kết nối cơ sở dữ liệu

    // Xóa tất cả dữ liệu cũ trước khi chèn dữ liệu mới
    await GiangVien.deleteMany({});
    await SinhVien.deleteMany({});
    await NguoiDung.deleteMany({});
    await KhoaHoc.deleteMany({});
    await ThongBao.deleteMany({});

    // Tạo dữ liệu NguoiDung
    const nguoiDung1 = new NguoiDung({
      tenDangNhap: 'giangvien1',
      matKhau: 'password',
      email: 'giangvien1@example.com',
      vaiTro: 'Teacher'
    });
    const nguoiDung2 = new NguoiDung({
      tenDangNhap: 'sinhvien1',
      matKhau: 'password',
      email: 'sinhvien1@example.com',
      vaiTro: 'Student'
    });

    await nguoiDung1.save();
    await nguoiDung2.save();

    // Tạo GiangVien
    const giangVien = new GiangVien({
      hoTen: 'Nguyen Van A',
      gioiThieu: 'Chuyên gia lập trình',
      maNguoiDung: nguoiDung1._id
    });

    await giangVien.save();

    // Tạo SinhVien
    const sinhVien = new SinhVien({
      hoTen: 'Nguyen Van B',
      ngaySinh: new Date('1995-05-10'),
      soKhoaHocDaThamGia: 2,
      maNguoiDung: nguoiDung2._id,
      khoaHocs: []
    });

    await sinhVien.save();

    // Tạo dữ liệu cho KhoaHoc
    const taiLieu1 = {
      maTaiLieu: new mongoose.Types.ObjectId(),
      tenTaiLieu: 'Hướng dẫn lập trình JavaScript',
      loaiTaiLieu: 'PDF',
      duongDan: '/duongdan/huongdan-js.pdf'
    };

    const taiLieu2 = {
      maTaiLieu: new mongoose.Types.ObjectId(),
      tenTaiLieu: 'Video giảng dạy React',
      loaiTaiLieu: 'Video',
      duongDan: '/duongdan/video-react.mp4'
    };

    const quiz1 = {
      maQuiz: new mongoose.Types.ObjectId(),
      tenQuiz: 'Quiz về JavaScript',
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(new Date().getTime() + 3600000), // 1 giờ sau
      thoiGian: 30, // Thời gian 30 phút
      xemLaiBai: true,
      cauHoi: [
        {
          maCauHoi: new mongoose.Types.ObjectId(),
          noiDungCauHoi: 'JavaScript là gì?',
          dapAn: 'Ngôn ngữ lập trình',
          dapanChon: [
            {
              maAnswer: new mongoose.Types.ObjectId(),
              maSinhVien: sinhVien._id,
              dapAnChon: 'Ngôn ngữ lập trình',
              dungSai: true
            },
            {
              maAnswer: new mongoose.Types.ObjectId(),
              maSinhVien: sinhVien._id,
              dapAnChon: 'Ngôn ngữ máy',
              dungSai: false
            }
          ]
        }
      ]
    };

    const khoaHoc = new KhoaHoc({
      maKhoaHoc: `KH-${new mongoose.Types.ObjectId()}`, // Thêm mã khóa học
      tenKhoaHoc: 'Khóa học lập trình JavaScript',
      moTa: 'Khóa học cơ bản về JavaScript cho người mới bắt đầu.',
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(new Date().getTime() + 604800000), // 1 tuần sau
      maGiangVien: giangVien._id,
      taiLieu: [taiLieu1, taiLieu2],
      quizzes: [quiz1]
    });

    await khoaHoc.save();

    console.log('Dữ liệu đã được chèn thành công!');
    process.exit();
  } catch (error) {
    console.error('Lỗi khi chèn dữ liệu:', error);
    process.exit(1);
  }
};

seedData();
