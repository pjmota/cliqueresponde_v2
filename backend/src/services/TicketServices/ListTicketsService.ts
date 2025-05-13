import {
  Op,
  fn,
  where,
  col,
  Filterable,
  Includeable,
  literal,
  Sequelize
} from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";

import { intersection, isEmpty } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import ContactTag from "../../models/ContactTag";

import removeAccents from "remove-accents";

import FindCompanySettingOneService from "../CompaniesSettings/FindCompanySettingOneService";
import logger from "../../utils/logger";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  updatedAt?: string;
  showAll?: string;
  userId?: number;
  withUnreadMessages?: string;
  queueIds?: number[];
  tags?: number[];
  users?: number[];
  contacts?: string[];
  updatedStart?: string;
  updatedEnd?: string;
  connections?: string[];
  whatsappIds?: number[];
  statusFilters?: string[];
  queuesFilter?: string[];
  isGroup?: string;
  companyId: number;
  allTicket?: string;
  sortTickets?: string;
  searchOnMessages?: string;
  contactNumber?: string;
  exceptionsIds?: string[];
  notResponse?: string;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  status,
  date,
  dateStart,
  dateEnd,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages = "false",
  whatsappIds,
  statusFilters,
  companyId,
  sortTickets = "DESC",
  searchOnMessages = "false",
  contactNumber,
  exceptionsIds,
  notResponse
}: Request): Promise<Response> => {
  const user = await ShowUserService(userId, companyId);
  const userQueueIds = user.queues.map(queue => queue.id);

  //Isto é porque a rota exige nessa versão que o queueIds seja enviado
  queueIds = (!queueIds || isEmpty(queueIds)) ? (contactNumber || (whatsappIds && !isEmpty(whatsappIds)) ? userQueueIds : queueIds) : queueIds;
   
  const showTicketAllQueues = user.allHistoric === "enabled";
  const showTicketWithoutQueue = user.allTicket === "enable";
  const showGroups = user.allowGroup === true;
  const showPendingNotification = await FindCompanySettingOneService({
    companyId,
    column: "showNotificationPending"
  });
  const showNotificationPendingValue =
    showPendingNotification[0].showNotificationPending;
  let whereCondition: Filterable["where"];

  whereCondition = {
    ...(status === "open" &&
    user.allTicketsQueuesAttending === "enable" &&
    user.profile === "user"
      ? {}
      : { [Op.or]: [{ userId }, { status: "pending" }] }),
    ...(status === "open" &&
    user.allTicketsQueuesAttending === "enable" &&
    user.profile === "user"
      ? {}
      : {
          queueId: showTicketWithoutQueue
            ? { [Op.or]: [queueIds, null] }
            : { [Op.or]: [queueIds] }
        }),
    companyId
  };

  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: [
        "id",
        "name",
        "number",
        "email",
        "profilePicUrl",
        "acceptAudioMessage",
        "active",
        "urlPicture",
        "companyId"
      ],
      include: ["extraInfo", "tags"]
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
      attributes: ["id", "name", "expiresTicket", "groupAsTicket"]
    }
  ];

  
  if (status === "open") {
    
    whereCondition = {
      ...whereCondition,
      ...(user.allTicketsQueuesAttending === "enable" && user.profile === "user"
        ? {}
        : { userId }),
      queueId: queueIds
    };
  } else if (status === "group" && user.allowGroup && user.whatsappId) {
    whereCondition = {
      companyId,
      ...(queueIds === null ? {queueId: null} : {queueId: { [Op.or]: [queueIds, null] }}),
      whatsappId: user.whatsappId
    };
  } else if (status === "group" && user.allowGroup && !user.whatsappId) {
    whereCondition = {
      companyId,
      ...(queueIds === null ? {queueId: null} : {queueId: { [Op.or]: [queueIds, null] }})
    };
  } else if (
    user.profile === "user" &&
    status === "pending" &&
    showTicketWithoutQueue
  ) {
    const TicketsUserFilter: any[] | null = [];

    let ticketsIds = [];

    if (!showTicketAllQueues) {
      ticketsIds = await Ticket.findAll({
        where: {
          userId: { [Op.or]: [user.id, null] },
          queueId: { [Op.or]: [queueIds, null] },
          status: "pending",
          companyId
        }
      });
    } else {
      ticketsIds = await Ticket.findAll({
        where: {
          userId: { [Op.or]: [user.id, null] },
          // queueId: { [Op.or]: [queueIds, null] },
          status: "pending",
          companyId
        }
      });
    }

    if (ticketsIds) {
      TicketsUserFilter.push(ticketsIds.map(t => t.id));
    }
    // }

    const ticketsIntersection: number[] = intersection(...TicketsUserFilter);

    whereCondition = {
      ...whereCondition,
      id: ticketsIntersection
    };
  } else if (
    user.profile === "user" &&
    status === "pending" &&
    !showTicketWithoutQueue
  ) {
    const TicketsUserFilter: any[] | null = [];

    let ticketsIds = [];

    if (!showTicketAllQueues) {
      ticketsIds = await Ticket.findAll({
        where: {
          companyId,
          ...(user.allTicketsQueuesWaiting === "disable"
            ? { userId: { [Op.or]: [user.id, null] } }
            : {}),
          status: "pending",
          queueId: { [Op.in]: queueIds }
        }
      });
    } else {
      ticketsIds = await Ticket.findAll({
        where: {
          companyId,
          [Op.or]: [
            {
              userId: { [Op.or]: [user.id, null] }
            },
            {
              status: "pending"
            }
          ],
          // queueId: { [Op.in] : queueIds},
          status: "pending"
        }
      });
    }

    if (ticketsIds) {
      TicketsUserFilter.push(
        ticketsIds
          .filter(e =>
            user.allTicketsQueuesWaiting === "disable"
              ? e.userId === user.id
              : e
          )
          .map(t => t.id)
      );
    }
    // }

    const ticketsIntersection: number[] = intersection(...TicketsUserFilter);

    whereCondition = {
      ...whereCondition,
      id: ticketsIntersection
    };
  }

  if (
    showAll === "true" &&
    (user.profile === "admin" || user.allUserChat === "enabled") &&
    status !== "search"
  ) {
    if (user.allHistoric === "enabled" && showTicketWithoutQueue) {
      whereCondition = { 
        companyId,
        ...(queueIds === null ? {queueId: null} : {queueId: { [Op.or]: [queueIds, null] }})
      };
    } else if (user.allHistoric === "enabled" && !showTicketWithoutQueue) {
      whereCondition = { companyId, queueId: { [Op.ne]: null } };
    } else if (user.allHistoric === "disabled" && showTicketWithoutQueue) {
      whereCondition = { companyId, queueId: { [Op.or]: [queueIds, null] } };
    } else if (user.allHistoric === "disabled" && !showTicketWithoutQueue) {
      whereCondition = { companyId, queueId: queueIds };
    }
  }

  if (status && status !== "search") {
    whereCondition = {
      ...whereCondition,
      status:
        showAll === "true" && status === "pending"
          ? { [Op.or]: [status, "lgpd"] }
          : status
    };
  }

  if (status === "closed") {
    let latestTickets;

    if (!showTicketAllQueues) {
      let whereCondition2: Filterable["where"] = {
        companyId,
        status: "closed"
      };

      if (showAll === "false" && user.profile === "admin") {
        whereCondition2 = {
          ...whereCondition2,
          queueId: queueIds,
          userId
        };
      } else {
        whereCondition2 = {
          ...whereCondition2,
          queueId:
            showAll === "true" || showTicketWithoutQueue
              ? { [Op.or]: [queueIds, null] }
              : queueIds,
          ...(user.allTicketsQueuesWaiting === "disable"
            ? { userId: user.id }
            : {})
        };
      }

      latestTickets = await Ticket.findAll({
        attributes: [
          "companyId",
          "contactId",
          "whatsappId",
          [literal('MAX("id")'), "id"]
        ],
        where: whereCondition2,
        group: ["companyId", "contactId", "whatsappId"]
      });
    } else {
      let whereCondition2: Filterable["where"] = {
        companyId,
        status: "closed"
      };

      if (
        showAll === "false" &&
        (user.profile === "admin" || user.allUserChat === "enabled")
      ) {
        whereCondition2 = {
          ...whereCondition2,
          queueId: queueIds,
          userId
        };
      } else {
        whereCondition2 = {
          ...whereCondition2,
          queueId:
            showAll === "true" || showTicketWithoutQueue
              ? { [Op.or]: [queueIds, null] }
              : queueIds
        };
      }

      latestTickets = await Ticket.findAll({
        attributes: [
          "companyId",
          "contactId",
          "whatsappId",
          [literal('MAX("id")'), "id"]
        ],
        where: whereCondition2,
        group: ["companyId", "contactId", "whatsappId"]
      });
    }

    const ticketIds = latestTickets.map(t => t.id);

    whereCondition = {
      id: ticketIds
    };
  } else if (status === "search") {
    whereCondition = {
      companyId
    };
    let latestTickets;
    if (!showTicketAllQueues && user.profile === "user") {
      latestTickets = await Ticket.findAll({
        attributes: [
          "companyId",
          "contactId",
          "whatsappId",
          [literal('MAX("id")'), "id"]
        ],
        where: {
          [Op.or]: [{ userId }, { status: ["open", "pending", "closed", "group"] }],
          queueId:
            showAll === "true" || showTicketWithoutQueue
              ? { [Op.or]: [queueIds, null] }
              : queueIds,
          companyId
        },
        group: ["companyId", "contactId", "whatsappId"]
      });

    } else {
      let whereCondition2: Filterable["where"] = {
        companyId,
        [Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }]
      };

      if (showAll === "false" && user.profile === "admin") {
        whereCondition2 = {
          ...whereCondition2,
          queueId: queueIds

          // [Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }],
        };
      } else if (showAll === "true" && user.profile === "admin") {
        whereCondition2 = {
          companyId,
          queueId: { [Op.or]: [queueIds, null] }
          // status: ["pending", "closed", "group"]
        };
      }

      latestTickets = await Ticket.findAll({
        attributes: [
          "companyId",
          "contactId",
          "whatsappId",
          [literal('MAX("id")'), "id"]
        ],
        where: whereCondition2,
        group: ["companyId", "contactId", "whatsappId"]
      });
    }

    const ticketIds = latestTickets.map(t => t.id);

    whereCondition = {
      ...whereCondition,
      id: ticketIds
    };

    // if (date) {
    //   whereCondition = {
    //     createdAt: {
    //       [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
    //     }
    //   };
    // }

    // if (dateStart && dateEnd) {
    //   whereCondition = {
    //     updatedAt: {
    //       [Op.between]: [+startOfDay(parseISO(dateStart)), +endOfDay(parseISO(dateEnd))]
    //     }
    //   };
    // }

    // if (updatedAt) {
    //   whereCondition = {
    //     updatedAt: {
    //       [Op.between]: [
    //         +startOfDay(parseISO(updatedAt)),
    //         +endOfDay(parseISO(updatedAt))
    //       ]
    //     }
    //   };
    // }

    if (searchParam) {
      const sanitizedSearchParam = removeAccents(
        searchParam.toLocaleLowerCase().trim()
      );
      if (searchOnMessages === "true") {
        includeCondition = [
          ...includeCondition,
          {
            model: Message,
            as: "messages",
            attributes: ["id", "body"],
            where: {
              body: where(
                fn("LOWER", fn("unaccent", col("body"))),
                "LIKE",
                `%${sanitizedSearchParam}%`
              )
              // ticketId:
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
                fn("LOWER", fn("unaccent", col("contact.name"))),
                "LIKE",
                `%${sanitizedSearchParam}%`
              )
            },
            { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
            {
              "$message.body$": where(
                fn("LOWER", fn("unaccent", col("body"))),
                "LIKE",
                `%${sanitizedSearchParam}%`
              )
            }
          ]
        };
      } else {
        /* whereCondition = {
          ...whereCondition,
          [Op.and]: [
            {
              "$contact.name$": where(
                fn("LOWER", fn("unaccent", col("contact.name"))),
                "LIKE",
                `%${sanitizedSearchParam}%`
              )
            },
            { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } }
            // {
            //   "$message.body$": where(
            //     fn("LOWER", fn("unaccent", col("body"))),
            //     "LIKE",
            //     `%${sanitizedSearchParam}%`
            //   )
            // }
          ]
        }; */

        whereCondition = {
          ...whereCondition,
          [Op.or]: [
            where(
              fn("LOWER", fn("unaccent", col("contact.name"))),
              {
                [Op.like]: `%${sanitizedSearchParam}%`
              }
            ),
            {
              "$contact.number$": {
                [Op.like]: `%${sanitizedSearchParam}%`
              }
            }
          ]
        };
      }
    }

    
    if (Array.isArray(tags) && tags.length > 0) {
      const contactTagFilter: any[] | null = [];
      // for (let tag of tags) {
      const contactTags = await ContactTag.findAll({
        where: { tagId: tags }
      });
      if (contactTags) {
        contactTagFilter.push(contactTags.map(t => t.contactId));
      }
      // }

      const contactsIntersection: number[] = intersection(...contactTagFilter);

      whereCondition = {
        ...whereCondition,
        contactId: contactsIntersection
      };
    }

    if (Array.isArray(users) && users.length > 0) {
      whereCondition = {
        ...whereCondition,
        userId: users
      };
    }
    
    if (Array.isArray(whatsappIds) && whatsappIds.length > 0) {
      whereCondition = {
        ...whereCondition,
        whatsappId: whatsappIds
      };
    }

    if (Array.isArray(statusFilters) && statusFilters.length > 0) {
      whereCondition = {
        ...whereCondition,
        status: { [Op.in]: statusFilters }
      };
    }

    
    if (!user.super && user.profile !== "admin") {
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

  } else if (withUnreadMessages === "true") {
    whereCondition = {
      [Op.or]: [
        {
          userId,
          status: showNotificationPendingValue
            ? { [Op.notIn]: ["closed", "lgpd", "nps"] }
            : { [Op.notIn]: ["pending", "closed", "lgpd", "nps", "group"] },
          queueId: { [Op.in]: userQueueIds },
          unreadMessages: { [Op.gt]: 0 },
          companyId,
          isGroup: showGroups ? { [Op.or]: [true, false] } : false
        },
        {
          status: showNotificationPendingValue
            ? { [Op.in]: ["pending", "group"] }
            : { [Op.in]: ["group"] },
          queueId: showTicketWithoutQueue
            ? { [Op.or]: [userQueueIds, null] }
            : { [Op.or]: [userQueueIds] },
          unreadMessages: { [Op.gt]: 0 },
          companyId,
          isGroup: showGroups ? { [Op.or]: [true, false] } : false
        }
      ]
    };

    if (status === "group" && (user.allowGroup || showAll === "true")) {
      whereCondition = {
        ...whereCondition,
        queueId: { [Op.or]: [userQueueIds, null] }
      };
    }
  }

  whereCondition = {
    ...whereCondition,
    companyId
  };
  
  if (contactNumber) {
    
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          "$contact.name$": where(
            fn("LOWER", col("contact.name")),
            "ilike",
            `%${contactNumber}%`
          )
        },
        { "$contact.number$": { [Op.like]: `%${contactNumber}%` } }
      ]
    }

    if (Array.isArray(whatsappIds) && whatsappIds.length > 0) {
      whereCondition = {
        ...whereCondition,
        whatsappId: {
          [Op.in]: whatsappIds
        }
      };
    }
  }

  if(notResponse === 'true') {
    whereCondition = {
      status: 'open',
      companyId,
      fromMe: false,
      isGroup: false,
      ...(user.profile === 'user' && { userId: user.id }) 
    }    
  }


  let parsedExceptionsIds = [];

  // Validar exceptionsIds
  if (exceptionsIds) {

    if (Array.isArray(exceptionsIds)) {
      parsedExceptionsIds = exceptionsIds.filter((id) => typeof id === "string" || typeof id === "number");
    } else if (exceptionsIds && typeof exceptionsIds === "object") {
      // Converter objeto array-like para array
      parsedExceptionsIds = Array.from(exceptionsIds).filter(
        (id) => typeof id === "string" || typeof id === "number"
      );
    } else if (typeof exceptionsIds === "string") {
      // Tentar parsear como JSON, caso seja uma string JSON
      try {
        const parsed = JSON.parse(exceptionsIds);
        if (Array.isArray(parsed)) {
          parsedExceptionsIds = parsed.filter((id) => typeof id === "string" || typeof id === "number");
        } else {
          console.error("exceptionsIds JSON não é um array:", parsed);
        }
      } catch (error) {
        console.error("Erro ao parsear exceptionsIds como JSON:", error.message);
      }
    } else {
      console.error("exceptionsIds não é um array nem objeto válido:", exceptionsIds);
    }
  } else {
    console.log("Nenhum exceptionsIds recebido para filtragem.");
  }

  const limitBase = 15;
  let limit = limitBase;
  let offset = limit * (+pageNumber - 1);
  let tickets = [];
  let count = 0;
  
  do {
    const result = await Ticket.findAndCountAll({
      where: {
        ...whereCondition,
        ...(parsedExceptionsIds?.length > 0 ? {
          id: {
            [Op.notIn]: parsedExceptionsIds, // Exclui os IDs recebidos
          },
        } : {}),
      },
      include: includeCondition,
      attributes: [
        "id",
        "uuid",
        "userId",
        "queueId",
        "isGroup",
        "channel",
        "status",
        "contactId",
        "useIntegration",
        "lastMessage",
        "updatedAt",
        "unreadMessages"
      ],
      distinct: true,
      limit,
      offset,
      order: [["updatedAt", sortTickets]],
      subQuery: false,
      ...(status === 'open' ? {logging: console.log} : {})
    });

    const newTickets = result.rows;
    //logger.warn(`Consulta retornou ${newTickets.length} novos registros (offset: ${offset}, limit: ${limit})`);

    tickets = [...tickets, ...newTickets];
    // Remove duplicados baseado no ID
    tickets = Array.from(new Map(tickets.map(t => [t.id, t])).values());

    tickets = tickets.slice(0, limitBase);

    // Atualiza o offset pra posição real acumulada
    offset += newTickets.length;

    count = result.count;

    if (newTickets.length === 0 || tickets.length >= limitBase) {
      break; // Sai se não há mais registros ou se atingiu o limite desejado
    }

    // Se ainda não atingiu o limite desejado, aumenta o limit da próxima tentativa
    if ((status === "open" || status === "pending" ) && tickets.length < limitBase && newTickets.length > 0) {
      limit += 10;
    }
  } while (tickets.length < limitBase);

  const hasMore = count > offset;
  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
