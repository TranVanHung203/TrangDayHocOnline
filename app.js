import express from 'express';
import cors from 'cors';
import courseRoutes from './src/routes/courseRoutes.js';
import lessonRoutes from './src/routes/lessonRoutes.js';
import quizRoutes from './src/routes/quizRoutes.js';
import DatabaseConfig from './src/config/databaseConfig.js'; // Nhập lớp kết nối cơ sở dữ liệu
import jwtMiddleware from './src/middlewares/jwtMiddleware.js';
import { errorHandler } from './src/errors/errorHandler.js';

const app = express();
const databaseConfig = new DatabaseConfig(); // Tạo một thể hiện của lớp DatabaseConfig

// Middleware để xử lý JSON
app.use(express.json());

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000', // Đảm bảo địa chỉ này đúng
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Kết nối đến cơ sở dữ liệu
databaseConfig.connect();

// // Route API cho homepage
// app.use('/api', homepageRoute);


app.use(jwtMiddleware)
app.use('/courses', courseRoutes);
app.use('/lessons', lessonRoutes);
app.use('/quizzes', quizRoutes);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
