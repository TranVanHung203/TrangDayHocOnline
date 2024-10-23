import express from 'express';
import apiRoutes from './routes/api.js';
import connectDB from './config/databaseConfig.js';

const app = express();
const port = 8081 || 8888;

await connectDB();

app.use('/v1/api', apiRoutes)

app.listen(port, () => {
    console.log(`Backend Nodejs App listening on port ${port}`)
})