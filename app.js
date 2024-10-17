import express from 'express';
import cors from 'cors'; // Import cors
import homepageRoute from './src/routes/homepage.js';
import DatabaseConfig from './src/config/databaseConfig.js'; // Nhập lớp kết nối cơ sở dữ liệu

const app = express();
const databaseConfig = new DatabaseConfig(); // Tạo một thể hiện của lớp DatabaseConfig

// Middleware để xử lý JSON
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // Thay đổi URL này thành địa chỉ frontend của bạn
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP được cho phép
  allowedHeaders: ['Content-Type', 'Authorization'], // Các header được cho phép
}));


// Kết nối đến cơ sở dữ liệu
databaseConfig.connect();

// Định nghĩa route cho trang chủ
app.use('/api', homepageRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
