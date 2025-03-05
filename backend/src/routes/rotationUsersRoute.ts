import express from "express";
import isAuth from "../middleware/isAuth";

import * as RotationUsersController from "../controllers/RotationUsersController";
import multer from "multer";
import uploadConfig from "../config/upload";
const upload = multer(uploadConfig);

const rotationUsersRoutes = express.Router();

rotationUsersRoutes.get("/rotationUsers", isAuth, RotationUsersController.index);

rotationUsersRoutes.post("/rotationUsers", isAuth, upload.array("file"), RotationUsersController.store);

rotationUsersRoutes.put("/rotationUsers/:id", isAuth, upload.array("file"), RotationUsersController.update);

rotationUsersRoutes.get("/rotationUsers/:id", isAuth, RotationUsersController.show);

rotationUsersRoutes.delete("/rotationUsers/:id", isAuth, RotationUsersController.remove);

export default rotationUsersRoutes;