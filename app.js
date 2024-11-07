import express from 'express';
import cors from 'cors';
import homepageRoute from './src/routes/homepage.js';
import courseRoutes from './src/routes/courseRoutes.js';
import updatecourse from './src/routes/updatecourse.js';
import DatabaseConfig from './src/config/databaseConfig.js'; // Nhập lớp kết nối cơ sở dữ liệu

const app = express();
const databaseConfig = new DatabaseConfig(); // Tạo một thể hiện của lớp DatabaseConfig

// Middleware để xử lý JSON
app.use(express.json());

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000', // Đảm bảo địa chỉ này đúng
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Kết nối đến cơ sở dữ liệu
databaseConfig.connect();

// // Route API cho homepage
// app.use('/api', homepageRoute);

// Route tạo khóa học
app.use('/courses', courseRoutes);


// app.use('/updatecourses', updatecourse);

// // Định nghĩa route cho khóa học
// app.use('/api', khoaHocRoute); // Sử dụng route khóa học

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
