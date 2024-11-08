import multer from 'multer';
import path from 'path';

// Cấu hình storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Đường dẫn lưu file tại gốc dự án
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Tên file duy nhất
    }
});

// Tạo middleware upload và thêm giới hạn dung lượng
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Giới hạn dung lượng tệp lên đến 10MB
    }
});

// Export middleware để sử dụng trong các route
export default upload;
