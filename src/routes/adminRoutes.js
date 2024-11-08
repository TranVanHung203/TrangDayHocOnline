import express from 'express';

import { authToken } from '../middlewares/authMiddleware.js';
import { deleteUserController, getAllUserController, getUserController, updateUserController } from '../controllers/adminController.js';

const adminApiRouter = express.Router();

adminApiRouter.all("*", authToken);

adminApiRouter.patch("/", updateUserController);
adminApiRouter.delete("/:iduser", deleteUserController);
adminApiRouter.get("/", getAllUserController);
adminApiRouter.get("/:iduser", getUserController);

export default adminApiRouter;