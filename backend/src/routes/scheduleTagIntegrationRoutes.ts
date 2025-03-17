import { Router } from "express";
import * as ScheduleTagIntegrationController from "../controllers/ScheduleTagIntegrationController";
import isAuth from "../middleware/isAuth";


const scheduleTagIntegrationRoutes = Router();

scheduleTagIntegrationRoutes.get("/scheduleTagIntegration", isAuth, ScheduleTagIntegrationController.index);

scheduleTagIntegrationRoutes.post("/scheduleTagIntegration", isAuth, ScheduleTagIntegrationController.store);

scheduleTagIntegrationRoutes.get("/scheduleTagIntegration/:id", isAuth, ScheduleTagIntegrationController.show);

scheduleTagIntegrationRoutes.put("/scheduleTagIntegration/:id", isAuth, ScheduleTagIntegrationController.update);

scheduleTagIntegrationRoutes.delete("/scheduleTagIntegration/:id", isAuth, ScheduleTagIntegrationController.remove);

export default scheduleTagIntegrationRoutes;
