import express from "express";
import isAuth from "../middleware/isAuth";

import * as PermissionController from "../controllers/PermissionController";

const permissionRoutes = express.Router();

permissionRoutes.get("/permissions", isAuth, PermissionController.index);



export default permissionRoutes;
