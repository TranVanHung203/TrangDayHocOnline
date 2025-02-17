import express from 'express';

import { authToken } from '../middlewares/authMiddleware.js';
import {
    createLecturerController, deleteUserController, getAllAdminController, getAllLecturerController, getAllStudentController, getAllUserController,
    getUserController, updateUserController
} from '../controllers/adminController.js';

const adminApiRouter = express.Router();

adminApiRouter.all("*", authToken);

adminApiRouter.post("/lecturer", createLecturerController);
adminApiRouter.patch("/", updateUserController);
adminApiRouter.delete("/:iduser", deleteUserController);
adminApiRouter.get("/", getAllUserController);
adminApiRouter.get("/student", getAllStudentController);
adminApiRouter.get("/lecturer", getAllLecturerController);
adminApiRouter.get("/admin", getAllAdminController);
adminApiRouter.get("/:iduser", getUserController);

export default adminApiRouter;