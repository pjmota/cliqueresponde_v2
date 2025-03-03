import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import logger from "../utils/logger";
import { instrument } from "@socket.io/admin-ui";
import User from "../models/User";
import { ReceibedWhatsAppService } from "../services/WhatsAppOficial/ReceivedWhatsApp";
import { JwtPayload, verify } from "jsonwebtoken";
import authConfig from "../config/auth";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });

  if (process.env.SOCKET_ADMIN && JSON.parse(process.env.SOCKET_ADMIN)) {
    User.findByPk(1).then(
      (adminUser) => {
        instrument(io, {
          auth: {
            type: "basic",
            username: adminUser.email,
            password: adminUser.passwordHash
          },
          mode: "development",
        });
      }
    );
  }

  const workspaces = io.of(/^\/\w+$/);
  workspaces.on("connection", socket => {

    const token_api_oficial = process.env.TOKEN_API_OFICIAL || "";
    console.log("token_api_oficial", socket?.handshake?.query?.token);
    const token = Array.isArray(socket?.handshake?.query?.token) ? socket.handshake.query.token[1] : socket?.handshake?.query?.token?.split(" ")[1];

    if (!token) {
      return socket.disconnect();
    }

    if (token !== token_api_oficial) {
      try {
        const decoded = verify(token, authConfig.secret);
        const companyId = socket.nsp.name.split("/")[1]

        const decodedPayload = decoded as JwtPayload;
        const companyIdToken = decodedPayload.companyId;

        if (+companyIdToken !== +companyId) {
          logger.error(`CompanyId do token ${companyIdToken} diferente da companyId do socket ${companyId}`)
          return socket.disconnect();
        }
      } catch (error) {
        logger.error(JSON.stringify(error), "Error decoding token");
        if (error.message !== "jwt expired") {
          return socket.disconnect();
        }
        // return socket.disconnect();
      }
    } else {
      logger.info(`Client connected namespace ${socket.nsp.name}`);
      logger.info(`Conectado com sucesso na API OFICIAL`);
    }
    // logger.info(`Client connected namespace ${socket.nsp.name}`);
    // console.log(`namespace ${socket.nsp.name}`, "UserId Socket", userId)


    socket.on("joinChatBox", (ticketId: string) => {
      // logger.info(`A client joined a ticket channel namespace ${socket.nsp.name}`);
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      // logger.info(`A client joined notification channel namespace ${socket.nsp.name}`);
      socket.join("notification");
    });

    socket.on("joinVersion", () => {
      logger.info(`A client joined version channel namespace ${socket.nsp.name}`);
      socket.join("version");
    });

    socket.on("joinTickets", (status: string) => {
      // logger.info(`A client joined to ${status} channel namespace ${socket.nsp.name}`);
      socket.join(status);
    });

    socket.on("joinTicketsLeave", (status: string) => {
      // logger.info(`A client leave to ${status} tickets channel.`);
      socket.leave(status);
    });

    socket.on("joinChatBoxLeave", (ticketId: string) => {
      // logger.info(`A client leave ticket channel ${ticketId} namespace ${socket.nsp.name}`);
      socket.leave(ticketId);
    });

    socket.on("receivedMessageWhatsAppOficial", (data: any) => {

      const receivedService = new ReceibedWhatsAppService();

      receivedService.getMessage(data);

    });

    socket.on("readMessageWhatsAppOficial", (data: any) => {

      const receivedService = new ReceibedWhatsAppService();

      receivedService.readMessage(data);

    });

    socket.on("disconnect", () => {
      // logger.info(`Client disconnected namespace ${socket.nsp.name}`);
    });

  });
  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};