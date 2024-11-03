import KhoaHoc from '../models/courseModel.js';

// Hàm lấy tất cả các khóa 
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



export const createCourse = async (req, res) => {
  try {
    const { courseName, description, startDate, endDate, instructorId, studentEmails } = req.body;

    // Kiểm tra xem các thông tin bắt buộc có được truyền lên không
    if (!courseName || !description || !startDate || !endDate || !instructorId) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin khóa học." });
    }

    // Tạo mã khóa học tự động
    const yearMonth = new Date().getFullYear() + ("0" + (new Date().getMonth() + 1)).slice(-2);  // Format YYYYMM
    const lastCourse = await KhoaHoc.findOne().sort({ maKhoaHoc: -1 }).limit(1);  // Tìm khóa học có mã lớn nhất

    let courseCode = `KH-${yearMonth}-001`;  // Mặc định là 001
    if (lastCourse) {
      const lastCode = parseInt(lastCourse.maKhoaHoc.split('-')[2], 10);  // Lấy số thứ tự từ mã khóa học
      const newCode = lastCode + 1;  // Tăng số thứ tự lên 1
      courseCode = `KH-${yearMonth}-${("00" + newCode).slice(-3)}`;  // Cập nhật mã khóa học với số thứ tự mới
    }

    // Tạo một chuỗi ngẫu nhiên để thêm vào mã khóa học
    const randomSuffix = Math.floor(Math.random() * 1000);  // Tạo số ngẫu nhiên từ 0 đến 999
    courseCode += `-${randomSuffix}`;  // Thêm phần ngẫu nhiên vào mã khóa học

    // Tạo khóa học mới với các thông tin cơ bản
    const newCourse = new KhoaHoc({
      maKhoaHoc: courseCode,  // Mã khóa học tự động tạo
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
        console.warn(user.maNguoiDung)

        if (user) {
          // Tìm hoặc tạo sinh viên từ bảng SinhVien dựa trên mã người dùng (maNguoiDung)
          let student = await SinhVien.findOne({ maNguoiDung: user.maNguoiDung });

          // Nếu sinh viên chưa có trong bảng SinhVien, tạo mới
          if (!student) {
            console.warn(`Không tìm thấy sinh viên với email: ${email}.`);
            continue; // Bỏ qua sinh viên này và tiếp tục với sinh viên tiếp theo
          }

          // Thêm khóa học vào danh sách khóa học của sinh viên
          student.khoaHocs.push({
            maKhoaHoc: savedCourse.maKhoaHoc,
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



export const editCourse = async (req, res) => {
  try {
    const { courseCode } = req.params; // Lấy courseCode từ URL params
    // Lấy dữ liệu từ req.body
    const { tenKhoaHoc, moTa, ngayBatDau, ngayKetThuc, maGiangVien, studentEmails } = req.body;

    console.log(req.body); // Log the received request body

    // Kiểm tra xem các thông tin bắt buộc có được truyền lên không
    if (!tenKhoaHoc || !moTa || !ngayBatDau || !ngayKetThuc || !maGiangVien) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin khóa học nè." });
    }

    // Kiểm tra ngày bắt đầu và ngày kết thúc
    if (new Date(ngayBatDau) >= new Date(ngayKetThuc)) {
      return res.status(400).json({ message: "Ngày bắt đầu phải trước ngày kết thúc." });
    }

    // Cập nhật thông tin khóa học theo maKhoaHoc
    const updatedCourse = await KhoaHoc.findOneAndUpdate(
      { maKhoaHoc: courseCode },  // Sử dụng maKhoaHoc thay vì _id
      {
        tenKhoaHoc: tenKhoaHoc,      // Sử dụng key từ req.body
        moTa: moTa,
        ngayBatDau: new Date(ngayBatDau),
        ngayKetThuc: new Date(ngayKetThuc),
        maGiangVien: maGiangVien,
      },
      { new: true } // Trả về dữ liệu mới sau khi cập nhật
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Không tìm thấy khóa học với mã này." });
    }

    // Lấy danh sách sinh viên từ SinhVien
    const students = await SinhVien.find({}); // Lấy tất cả sinh viên

    for (const student of students) {
      // Tìm người dùng tương ứng với sinh viên
      const user = await NguoiDung.findOne({ maNguoiDung: student.maNguoiDung });

      if (user) {
        const studentEmailExists = studentEmails.includes(user.email); // Kiểm tra email trong studentEmails

        // Nếu email còn trong studentEmails
        if (studentEmailExists) {
          // Cập nhật khóa học trong danh sách của sinh viên
          const existingCourse = student.khoaHocs.find(kh => kh.maKhoaHoc === updatedCourse.maKhoaHoc);
          if (existingCourse) {
            // Cập nhật thông tin nếu sinh viên đã tham gia
            existingCourse.ngayDangKy = new Date(); // Cập nhật ngày đăng ký
          } else {
            // Nếu sinh viên chưa tham gia khóa học, thêm mới
            student.khoaHocs.push({
              maKhoaHoc: updatedCourse.maKhoaHoc,
              ngayDangKy: new Date(),
              tienDo: {
                soBaiGiangDaHoanThanh: 0,
                soBaiTapDaHoanThanh: 0,
                tongTienDo: 0,
              },
            });
          }
        } else {
          // Nếu email không còn trong studentEmails, xóa khóa học khỏi sinh viên
          const courseIndex = student.khoaHocs.findIndex(kh => kh.maKhoaHoc === updatedCourse.maKhoaHoc);
          if (courseIndex !== -1) {
            student.khoaHocs.splice(courseIndex, 1); // Xóa khóa học
          }
        }

        // Cập nhật số lượng khóa học đã tham gia
        student.soKhoaHocDaThamGia = student.khoaHocs.length;
        await student.save(); // Lưu thông tin sinh viên
      } else {
        console.warn(`Không tìm thấy người dùng cho maNguoiDung: ${student.maNguoiDung}`);
      }
    }

    res.status(200).json({ message: "Cập nhật khóa học thành công", course: updatedCourse });
  } catch (error) {
    console.error("Lỗi khi cập nhật khóa học:", error.message);
    res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật khóa học." });
  }
};





export const getCourseByCode = async (req, res) => {
  try {
    const { courseCode } = req.params; // Lấy mã khóa học từ URL params

    // Tìm khóa học theo maKhoaHoc
    const course = await KhoaHoc.findOne({ maKhoaHoc: courseCode });

    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học với mã này." });
    }

    // Tìm các sinh viên đã đăng ký khóa học này
    const students = await SinhVien.find({ 'khoaHocs.maKhoaHoc': courseCode });

    // Tìm email của các sinh viên từ maNguoiDung trong NguoiDung
    const studentEmails = await Promise.all(
      students.map(async (student) => {
        const user = await NguoiDung.findOne({ maNguoiDung: student.maNguoiDung });
        return {
          hoTen: student.hoTen,
          email: user ? user.email : null, // Lấy email từ đối tượng NguoiDung
        };
      })
    );

    // Gửi kết quả về frontend (trả về thông tin khóa học và danh sách email sinh viên)
    res.status(200).json({
      course,
      studentEmails,
    });
  } catch (error) {
    console.error("Lỗi khi lấy khóa học theo mã:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy khóa học." });
  }
};









