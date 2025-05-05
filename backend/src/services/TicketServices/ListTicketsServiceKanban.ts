import { Op, fn, where, col, Filterable, Includeable, literal } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";
import Whatsapp from "../../models/Whatsapp";
import { inspect } from "util";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string[] | string;
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  updatedAt?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  queueIds: number[];
  tags: number[];
  hasTags?: boolean;
  users: number[];
  companyId: number;
  pageSize?: number | string;
}


interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsServiceKanban = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  hasTags = undefined,
  users,
  status,
  date,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages,
  companyId,
  pageSize = 15
}: Request): Promise<Response> => {

  // console.log("REQUEST", {
  //   searchParam,
  //   pageNumber,
  //   queueIds,
  //   tags,
  //   hasTags,
  //   users,
  //   status,
  //   date,
  //   updatedAt,
  //   showAll,
  //   userId,
  //   withUnreadMessages,
  //   companyId
  // });




  const currentUser = await User.findOne({
    where: { id: userId },
    include: [
      {
        model: Ticket,
        as: "tickets",
        attributes: ["id"]
      }
    ]
  });

  


  const userTicketsIds = currentUser?.tickets?.map(ticket => ticket.id) || [];


  let whereCondition: Filterable["where"] = {
    queueId: { [Op.or]: [queueIds, null] }
  };

  // if (!currentUser.super && currentUser.profile !== "admin") {
  //   whereCondition = { ...whereCondition, [Op.or]: [{ userId }] };

  // }

  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["name"]
    },
  ];

  if (showAll === "true") {
    whereCondition = { queueId: { [Op.or]: [queueIds, null] } };

  }

  if (searchParam) {

    const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();

    includeCondition = [
      ...includeCondition,
      {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        where: {
          body: where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        required: false,
        duplicating: false
      }
    ];

    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          "$contact.name$": where(
            fn("LOWER", col("contact.name")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
        {
          "$message.body$": where(
            fn("LOWER", col("body")),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        }
      ]
    };




  }

  if (date) {
    whereCondition = {
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      }
    };

  }

  if (updatedAt) {
    whereCondition = {
      updatedAt: {
        [Op.between]: [
          +startOfDay(parseISO(updatedAt)),
          +endOfDay(parseISO(updatedAt))
        ]
      }
    };

  }

  if (withUnreadMessages === "true") {
    const user = await ShowUserService(userId);
    const userQueueIds = user.queues.map(queue => queue.id);

    whereCondition = {
      [Op.or]: [{ userId }, { status: "pending" }],
      queueId: { [Op.or]: [userQueueIds, null] },
      unreadMessages: { [Op.gt]: 0 }
    };

  }

  if (Array.isArray(tags) && tags.length > 0) {

    const userTickets = currentUser.profile !== "admin" ? userTicketsIds : undefined;

    whereCondition = {
      ...whereCondition,
      id: {
        [Op.and]: [
          {
            [Op.in]: literal(`(select "ticketId" from "TicketTags" tt where "tagId" in (${tags.join(',')}))`)
          },
          ...(userTickets ? [{ [Op.in]: userTickets }] : [])
        ]
      }
    };

  }

  if (hasTags == false) {
    whereCondition = {
      ...whereCondition,
      [Op.and]: [
        literal(`not exists (select 1 from "TicketTags" tt where tt."ticketId" = "Ticket"."id")`)
      ]
    };

  }

  if (Array.isArray(users) && users.length > 0) {
    whereCondition = {
      ...whereCondition,
      userId: {
        [Op.or]: [
          { [Op.in]: [...new Set(users)] },
          null
        ]
      }
    };

  }

  if (typeof status === "string") {
    status = JSON.parse(status);
  }
  if (Array.isArray(status) && status.length > 0) {
    whereCondition = {
      ...whereCondition,
      status: {
        [Op.in]: [...new Set(status)]
      }
    };

  }

  const limit = parseInt(pageSize as string, 15);
  const offset = limit * (+pageNumber - 1);

  whereCondition = {
    ...whereCondition,
    companyId
  };

  if (!currentUser.super && currentUser.profile !== "admin") {
    whereCondition = {
      ...whereCondition,
      [Op.and]: [
      {
        userId: {
        [Op.or]: [userId, null]
        }
      }
      ]
    };
  }

  // console.log("WHERE CONDITION", inspect(whereCondition, { depth: 100 }));

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
    subQuery: false
  });
  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsServiceKanban;