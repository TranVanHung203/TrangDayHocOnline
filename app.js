import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

import courseRoutes from './src/routes/courseRoutes.js';
import quizRoutes from './src/routes/quizRoutes.js';
import notifyRoutes from './src/routes/notifyRoutes.js'
import lessonRoutes from './src/routes/lessonRoutes.js';
import apiRoutes from './src/routes/userRoutes.js';
import adminApiRouter from './src/routes/adminRoutes.js';
import DatabaseConfig from './src/config/databaseConfig.js'; // Nhập lớp kết nối cơ sở dữ liệu
import { errorHandler } from './src/errors/errorHandler.js';


const app = express();
const databaseConfig = new DatabaseConfig(); // Tạo một thể hiện của lớp DatabaseConfig

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000', // Đảm bảo địa chỉ này đúng
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Kết nối đến cơ sở dữ liệu
databaseConfig.connect();

app.use('/', apiRoutes)

app.use('/admin', adminApiRouter)

app.use('/courses', courseRoutes);

app.use('/quizzes',quizRoutes);

app.use('/notify',notifyRoutes);

app.use('/lessons', lessonRoutes);

app.use(errorHandler);


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
