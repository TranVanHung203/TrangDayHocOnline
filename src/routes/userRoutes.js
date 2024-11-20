import express from 'express';
import {
    changePasswordController, createUserController, forgotPasswordController,
    loginUserController, resetPasswordController, logout,
    verifyAccountController,
    verifyEmailController
} from '../controllers/userController.js';
import { authToken } from '../middlewares/authMiddleware.js';

const apiRouter = express.Router();

apiRouter.all("*", authToken);

apiRouter.post("/register", createUserController);
apiRouter.post("/login", loginUserController);
apiRouter.get('/logout', logout);
apiRouter.put("/change-password", changePasswordController);
apiRouter.post('/forgot-password', forgotPasswordController);
apiRouter.patch('/reset-password', resetPasswordController);
apiRouter.post('/verify-account', verifyAccountController);
apiRouter.put('/verify-email', verifyEmailController);

apiRouter.get("/test", (req, res) => {
    return res.status(200).json("hello");
});

export default apiRouter;