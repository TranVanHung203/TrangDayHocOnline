import express from 'express';
import {
    changePasswordController, createUserController, forgotPasswordController,
    loginUserController, resetPasswordController,logout
} from '../controllers/userController.js';
import { authToken } from '../middlewares/authMiddleware.js';

const apiRouter = express.Router();

apiRouter.all("*", authToken);

apiRouter.post("/register", createUserController);
apiRouter.post("/login", loginUserController);
apiRouter.get('/logout', logout);
apiRouter.put("/change-password", changePasswordController);
apiRouter.post('/forgot-password', forgotPasswordController);
apiRouter.put('/reset-password', resetPasswordController);

apiRouter.get("/test", (req, res) => {
    return res.status(200).json("hello");
});

export default apiRouter;