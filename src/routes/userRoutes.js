import express from 'express';
import {
    changePasswordController, createUserController, forgotPasswordController,
    loginUserController, resetPasswordController, logout,
    verifyEmailController, getUserRole
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
apiRouter.patch('/verify-email', verifyEmailController);
apiRouter.get('/getRole', getUserRole);


apiRouter.get("/test", (req, res) => {
    return res.status(200).json("hello");
});

export default apiRouter;