import express from "express";
import isAuth from "../middleware/isAuth";

import * as AfterSalesController from "../controllers/AfterSalesController";

const routes = express.Router();

routes.get("/aftersales", isAuth, AfterSalesController.index);
routes.get("/aftersales/:afterSalesId", isAuth, AfterSalesController.show);
routes.post("/aftersales", isAuth, AfterSalesController.store);
routes.put("/aftersales/:afterSalesId", isAuth, AfterSalesController.update);
routes.delete("/aftersales/:afterSalesId", isAuth, AfterSalesController.remove);

export default routes;
