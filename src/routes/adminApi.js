import express from 'express';

import { authToken } from '../middlewares/authMiddleware.js';
import { deleteUserController, getAllUserController, getUserController, updateUserController } from '../controllers/adminController.js';

const adminApiRouter = express.Router();

adminApiRouter.all("*", authToken);

adminApiRouter.post("/update-user", updateUserController);
adminApiRouter.delete("/delete-user/:iduser", deleteUserController);
adminApiRouter.get("/user", getAllUserController);
adminApiRouter.get("/user/:iduser", getUserController);

export default adminApiRouter;