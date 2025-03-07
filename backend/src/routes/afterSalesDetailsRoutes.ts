import express from "express";
import isAuth from "../middleware/isAuth";

import * as AfterSalesDetailsController from "../controllers/AfterSalesDetailsController";

const routes = express.Router();

routes.get("/aftersales/:afterSalesId/details", isAuth, AfterSalesDetailsController.index);

export default routes;