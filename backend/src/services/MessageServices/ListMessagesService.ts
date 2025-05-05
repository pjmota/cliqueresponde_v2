import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import { Op } from "sequelize";
import { intersection } from "lodash";
import User from "../../models/User";
import isQueueIdHistoryBlocked from "../UserServices/isQueueIdHistoryBlocked";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import logger from "../../utils/logger";

interface Request {
  ticketId: string;
  companyId: number;
  pageNumber?: string;
  queues?: number[];
  user?: User;
  ticketDashboardString?: string
}

interface Response {
  messages: Message[];
  ticket: Ticket;
  count: number;
  hasMore: boolean;
}

const ListMessagesService = async ({
  pageNumber = "1",
  ticketId,
  companyId,
  queues = [],
  user,
  ticketDashboardString
}: Request): Promise<Response> => {


  if (!isNaN(Number(ticketId))) {
    const uuid = await Ticket.findOne({
      where: {
        id: ticketId,
        companyId
      },
      attributes: ["uuid"]
    });
    ticketId = uuid.uuid;
  }
  const ticket = await Ticket.findOne({
    where: {
      uuid: ticketId,
      companyId
    }
  });

  const ticketsFilter: any[] | null = [];

  const isAllHistoricEnabled = await isQueueIdHistoryBlocked({ userRequest: user.id });

  let ticketIds = [];
  if (!isAllHistoricEnabled) {
    ticketIds = await Ticket.findAll({
      where:
      {
        id: { [Op.lte]: ticket.id },
        companyId: ticket.companyId,
        contactId: ticket.contactId,
        whatsappId: ticket.whatsappId,
        isGroup: ticket.isGroup,
        queueId: user.profile === "admin" || user.allTicket === "enable" || (ticket.isGroup && user.allowGroup) ?
          {
            [Op.or]: [queues, null]
          } :
          { [Op.in]: queues },
      },
      attributes: ["id"],
      //logging: console.log
    }
  );
  } else {
    ticketIds = await Ticket.findAll({
      where:
      {
        id: { [Op.lte]: ticket.id },
        companyId: ticket.companyId,
        contactId: ticket.contactId,
        whatsappId: ticket.whatsappId,
        isGroup: ticket.isGroup
      },
      attributes: ["id"]
    });
  }

  if (ticketIds) {
    ticketsFilter.push(ticketIds.map(t => t.id));
  }
  // }

  const tickets: number[] = intersection(...ticketsFilter);

  if (!tickets) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  // await setMessagesAsRead(ticket);
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    where: { 
      ticketId: tickets, 
      companyId,
    },
    attributes: ["id", "fromMe", "mediaUrl", "body", "mediaType", "ack", "createdAt", "ticketId", "isDeleted", "queueId", "isForwarded", "isEdited", "isPrivate", "companyId", "wid"],
    limit,
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name"],
      },
      {
        model: Message,
        attributes: ["id", "fromMe", "mediaUrl", "body", "mediaType", "companyId", "wid"],
        as: "quotedMsg",
        include: [
          {
            model: Contact,
            as: "contact",
            attributes: ["id", "name"],
          }
        ],
        required: false
      },
      {
        model: Ticket,
        required: true,
        attributes: ["id", "whatsappId", "queueId"],
        include: [
          {
            model: Queue,
            as: "queue",
            attributes: ["id", "name", "color"]
          }
        ],
      }
    ],
    distinct: true,
    offset,
    subQuery: false,
    order: [["createdAt", "DESC"]],
    //logging: console.log
  });

  let filtredMessage = [];
  let newCount;

  if (ticketDashboardString === "true" && messages.length > 0) {
    const lastMessage = messages[0];
    if (lastMessage.ack === 4 && lastMessage.fromMe) {
      filtredMessage = messages.slice(1); // Remove o último registro
      newCount -= 1; // Ajusta o contador
    } else {
      filtredMessage = messages;
      newCount = count;
    }
  } else {
    filtredMessage = messages;
    newCount = count;
  }

  const hasMore = newCount > offset + filtredMessage.length;

  return {
    messages: filtredMessage.reverse(),
    ticket,
    count,
    hasMore
  };
};

export default ListMessagesService;