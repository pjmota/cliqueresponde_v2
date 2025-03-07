import express from "express";
import isAuth from "../middleware/isAuth";

import * as ContactCustomFieldController from "../controllers/ContactCustomFieldController";

const contactCustomFieldRoutes = express.Router();

contactCustomFieldRoutes.get('/custom-fields', isAuth, ContactCustomFieldController.index)
contactCustomFieldRoutes.post('/custom-fields', isAuth, ContactCustomFieldController.store)
contactCustomFieldRoutes.patch('/custom-fields/:contactId', isAuth, ContactCustomFieldController.patch)

export default contactCustomFieldRoutes;

