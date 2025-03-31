import express from "express";
import isAuth from "../middleware/isAuth";

import * as TicketTagController from "../controllers/TicketTagController";

const ticketTagRoutes = express.Router();

<<<<<<< HEAD
ticketTagRoutes.get("/ticket-tags/", isAuth, TicketTagController.index);
=======
>>>>>>> organizacional/main
ticketTagRoutes.put("/ticket-tags/:ticketId/:tagId", isAuth, TicketTagController.store);
ticketTagRoutes.delete("/ticket-tags/:ticketId", isAuth, TicketTagController.remove);

export default ticketTagRoutes;
