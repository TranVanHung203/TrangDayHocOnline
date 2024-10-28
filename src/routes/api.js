import express from 'express';
import { createUserController, loginUserController } from '../controllers/userController.js';

const apiRouter = express.Router();

apiRouter.post("/register", createUserController);
apiRouter.post("/login", loginUserController);

export default apiRouter;