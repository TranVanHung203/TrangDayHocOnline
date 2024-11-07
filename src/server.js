import express from 'express';
import apiRoutes from './routes/userApi.js';
import connectDB from './config/databaseConfig.js';
import cookieParser from "cookie-parser";
import adminApiRouter from './routes/adminApi.js';

const app = express();
const port = 8081 || 8888;

await new connectDB().connect();

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/v1/api', apiRoutes)
app.use('/v1/api', adminApiRouter)

app.listen(port, () => {
    console.log(`Backend Nodejs App listening on port ${port}`)
})