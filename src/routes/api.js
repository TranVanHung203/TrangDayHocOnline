import express from 'express';
import { createUserController } from '../controllers/userController.js';

const apiRouter = express.Router();

apiRouter.post("/register", createUserController);

export default apiRouter;