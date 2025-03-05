import express from "express";
import isAuth from "../middleware/isAuth";

import * as RotationsController from "../controllers/RotationsController";
import multer from "multer";
import uploadConfig from "../config/upload";
const upload = multer(uploadConfig);

const rotationsRoutes = express.Router();

rotationsRoutes.get("/rotations", isAuth, RotationsController.index);

rotationsRoutes.post("/rotations", isAuth, upload.array("file"), RotationsController.store);

rotationsRoutes.put("/rotations/:id", isAuth, upload.array("file"), RotationsController.update);

rotationsRoutes.get("/rotations/:id", isAuth, RotationsController.show);

export default rotationsRoutes;