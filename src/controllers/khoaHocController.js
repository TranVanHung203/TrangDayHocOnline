import KhoaHoc from '../models/khoahoc.schema.js';

// Hàm lấy tất cả các khóa học
export const getAllCourses = async (req, res) => {
  try {
    // Tìm tất cả khóa học từ cơ sở dữ liệu
    const courses = await KhoaHoc.find();

    // Kiểm tra xem có khóa học hay không
    if (courses.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khóa học nào." });
    }

    // Gửi kết quả về frontend
    res.status(200).json(courses);
  } catch (error) {
    // Trả lỗi nếu có
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách khóa học." });
  }
};
export const getCoursesByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Tìm các khóa học mà giáo viên đã giảng dạy theo teacherId dạng String
    const courses = await KhoaHoc.find({ maGiangVien: teacherId });

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khóa học nào của giáo viên." });
    }

    // Gửi kết quả về frontend (trả về toàn bộ thông tin khóa học)
    res.status(200).json(courses);
  } catch (error) {
    console.error("Lỗi khi lấy khóa học của giáo viên:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy khóa học của giáo viên." });
  }
};

import SinhVien from '../models/sinhvien.schema.js';
import NguoiDung from '../models/nguoidung.schema.js';

//Hàm tạo khóa học mới
export const createCourse = async (req, res) => {
  try {
    const { courseName, description, startDate, endDate, instructorId, studentEmails } = req.body;

    // Kiểm tra xem các thông tin bắt buộc có được truyền lên không
    if (!courseName || !description || !startDate || !endDate || !instructorId) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin khóa học." });
    }

    // Tạo khóa học mới với các thông tin cơ bản
    const newCourse = new KhoaHoc({
      tenKhoaHoc: courseName,
      moTa: description,
      ngayBatDau: new Date(startDate),
      ngayKetThuc: new Date(endDate),
      maGiangVien: instructorId,
      taiLieu: [],  // Các tài liệu có thể thêm sau
      quizzes: []   // Các quiz có thể thêm sau
    });

    // Lưu khóa học vào cơ sở dữ liệu
    const savedCourse = await newCourse.save();

    // Thêm khóa học mới cho các sinh viên dựa trên danh sách email
    if (studentEmails && studentEmails.length > 0) {
      for (const email of studentEmails) {
        // Tìm người dùng dựa trên email và vai trò là sinh viên
        const user = await NguoiDung.findOne({ email, vaiTro: 'Student' });

        if (user) {
          // Tìm hoặc tạo sinh viên từ bảng SinhVien dựa trên mã người dùng (maNguoiDung)
          let student = await SinhVien.findOne({ maNguoiDung: user._id });

          // Nếu sinh viên chưa có trong bảng SinhVien, tạo mới
          if (!student) {
            student = new SinhVien({
              hoTen: user.tenDangNhap,  // Sử dụng tên đăng nhập từ bảng người dùng làm tên sinh viên
              ngaySinh: null,           // Bạn có thể sửa lại để nhập thêm ngày sinh nếu cần
              soKhoaHocDaThamGia: 0,
              maNguoiDung: user._id,
              khoaHocs: []
            });
          }

          // Thêm khóa học vào danh sách khóa học của sinh viên
          student.khoaHocs.push({
            maKhoaHoc: savedCourse._id,
            ngayDangKy: new Date(),  // Ngày đăng ký tự động là ngày hiện tại
            tienDo: {
              soBaiGiangDaHoanThanh: 0,
              soBaiTapDaHoanThanh: 0,
              tongTienDo: 0
            }
          });

          // Cập nhật số lượng khóa học tham gia
          student.soKhoaHocDaThamGia = student.khoaHocs.length;

          // Lưu sinh viên sau khi cập nhật
          await student.save();
        } else {
          console.warn(`Không tìm thấy sinh viên với email: ${email}`);
        }
      }
    }

    // Trả về kết quả khóa học đã tạo thành công
    res.status(201).json({ message: "Tạo khóa học thành công", course: savedCourse });
  } catch (error) {
    console.error("Lỗi khi tạo khóa học:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi tạo khóa học." });
  }
};





export const getCourseByCode = async (req, res) => {
  try {
    const courseCode = req.params.code; // Lấy mã khóa học từ URL
    const course = await KhoaHoc.findOne({ maKhoaHoc: courseCode }); // Tìm khóa học theo maKhoaHoc

    if (!course) {
      return res.status(404).json({ message: 'Course not found' }); // Khóa học không tồn tại
    }

    res.json(course); // Trả về thông tin khóa học nếu tìm thấy
  } catch (error) {
    res.status(500).json({ message: error.message }); // Xử lý lỗi
  }

};

// Hàm để upload file
export const uploadFile = async (req, res) => {
  try {
    const { maKhoaHoc } = req.params;
    const { tenTaiLieu, loaiTaiLieu } = req.body;

    // Kiểm tra nếu file không tồn tại
    if (!req.file) {
      return res.status(400).json({ message: 'Chưa có file nào được tải lên!' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    // Tạo thông tin tài liệu mới
    const newTaiLieu = {
      tenTaiLieu,
      loaiTaiLieu,
      duongDan: filePath, // Đường dẫn file upload
    };

    // Tìm khóa học và cập nhật tài liệu mới
    const course = await KhoaHoc.findOneAndUpdate(
      { maKhoaHoc },
      { $push: { taiLieu: newTaiLieu } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại!' });
    }

    res.status(200).json(newTaiLieu); // Trả về tài liệu mới vừa được thêm
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};
