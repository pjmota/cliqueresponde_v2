import express from "express";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import multer from "multer";
import * as ChatController from "../controllers/ChatController";
const upload = multer(uploadConfig);


const routes = express.Router();

routes.get("/chats", isAuth, ChatController.index);
routes.get("/chats/:id", isAuth, ChatController.show);
routes.get("/chats/:id/messages", isAuth, ChatController.messages);
routes.post("/chats/:id/messages", isAuth, upload.single("medias") ,ChatController.saveMessage);
routes.post("/chats/:id/read", isAuth, ChatController.checkAsRead);
routes.post("/chats", isAuth, ChatController.store);
routes.put("/chats/:id", isAuth, ChatController.update);
routes.delete("/chats/:id", isAuth, ChatController.remove);

//image
routes.get("/chats/:id/file", isAuth, ChatController.getFile);


export default routes;
