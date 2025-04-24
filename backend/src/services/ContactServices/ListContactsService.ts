import { Sequelize, fn, col, where, Op, Filterable, literal } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ContactTag from "../../models/ContactTag";

import { intersection } from "lodash";
import Tag from "../../models/Tag";
import removeAccents from "remove-accents";
import Whatsapp from "../../models/Whatsapp";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  companyId: number;
  tagsIds?: number[];
  isGroup?: string;
  userId?: number;
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

/* const ListContactsService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId,
  tagsIds,
  isGroup,
  userId
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"];


  const user = await User.findOne({where:{id: userId}});

  if (!user.super && user.profile !== 'admin') {
    whereCondition = {
      ...whereCondition,
      createdBy: userId
    }
  }
  if (!user.super && user.profile !== 'admin') {

  }

  if (searchParam) {
    // console.log("searchParam", searchParam)
    const sanitizedSearchParam = removeAccents(searchParam.toLocaleLowerCase().trim());
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          name: where(
            fn("LOWER", fn("unaccent", col("Contact.name"))),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { number: { [Op.like]: `%${sanitizedSearchParam}%` } }
      ]
    };
  }

  whereCondition = {
    ...whereCondition,
    companyId
  };

  // const user = await ShowUserService(userId, companyId);

  // console.log(user)
  // if (user.whatsappId) {
  //   whereCondition = {
  //     ...whereCondition,
  //     whatsappId: user.whatsappId
  //   };
  // }

  if (Array.isArray(tagsIds) && tagsIds.length > 0) {

    const contactTagFilter: any[] | null = [];
    // for (let tag of tags) {
    const contactTags = await ContactTag.findAll({
      where: { tagId: { [Op.in]: tagsIds } }
    });
    if (contactTags) {
      contactTagFilter.push(contactTags.map(t => t.contactId));
    }
    // }

    const contactTagsIntersection: number[] = intersection(...contactTagFilter);

    whereCondition = {
      ...whereCondition,
      id: {
        [Op.in]: contactTagsIntersection
      }
    };
  }

  if (isGroup === "false") {
    whereCondition = {
      ...whereCondition,
      isGroup: false
    }
  }


  const attributes: any = [
    "id",
    "name",
    "number",
    "email",
    "profilePicUrl", 
    "isGroup", 
    "urlPicture", 
    "active", 
    "companyId", 
    "channel",
    [literal(`(select name from "Users" u2 where id = "Contact"."createdBy")`), 'createdByName'],
    [literal(`(
        select
          u."name"
        from
                      "Tickets" t
          inner join  "Users"   u on u.id = t."userId"
        where
              t."contactId" = "Contact".id
        order by
          t."updatedAt" desc
        limit 1
      )`), 'sellerName']
  ];


  const limit = 100;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    attributes,
    limit,
    include: [   
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name"]
      },
    ],
    offset,
    // subQuery: false,
    order: [["name", "ASC"]],
    logging: console.log
  });

  const hasMore = count > offset + contacts.length;

  return {
    contacts,
    count,
    hasMore
  };
}; */

const ListContactsService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId,
  tagsIds,
  isGroup,
  userId
}: Request): Promise<Response> => {
  const user = await User.findOne({ where: { id: userId } });

  let contatosFiltrados: number[] = [];

  // 1. Aplica filtro de tickets e createdBy apenas se não for super nem admin
  if (!user?.super && user?.profile !== "admin") {
    // Tickets do usuário
    const tickets = await Ticket.findAll({
      attributes: ["contactId", "userId"],
      where: {
        companyId,
        userId
      },
      include: [
        {
          model: Contact,
          as: "contact",
          required: true,
          where: { companyId },
        }
      ],
      order: [["updatedAt", "DESC"]],
      //logging: console.log
    });

    const contatosComTicket = new Map<number, number>();

    tickets.forEach(ticket => {
      const contactId = ticket.contactId;
      if (!contatosComTicket.has(contactId)) {
        contatosComTicket.set(contactId, contactId);
      }
    });

    const contatosComTicketIds = Array.from(contatosComTicket.values());

    // Contatos criados pelo usuário
    const contatosCriados = await Contact.findAll({
      where: {
        createdBy: userId,
        companyId
      },
      attributes: ["id"]
    });

    const contatosCriadosIds = contatosCriados.map(c => c.id);

    // União única dos dois
    contatosFiltrados = Array.from(new Set([...contatosComTicketIds, ...contatosCriadosIds]));
  }

  // 2. Condição principal
  let whereCondition: Filterable["where"] = {
    companyId
  };

  if (contatosFiltrados.length > 0) {
    whereCondition = {
      ...whereCondition,
      ...(user.viewAllContacts === 'enable' ? {} : {id: { [Op.in]: contatosFiltrados }})
    };
  }

  if (searchParam) {
    const sanitizedSearchParam = removeAccents(searchParam.toLocaleLowerCase().trim());
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          name: where(
            fn("LOWER", fn("unaccent", col("Contact.name"))),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { number: { [Op.like]: `%${sanitizedSearchParam}%` } }
      ]
    };
  }

  if (Array.isArray(tagsIds) && tagsIds.length > 0) {
    const contactTags = await ContactTag.findAll({
      where: { tagId: { [Op.in]: tagsIds } }
    });

    const contactTagsIds = contactTags.map(t => t.contactId);

    whereCondition = {
      ...whereCondition,
      id: { [Op.in]: contactTagsIds.filter(id => contatosFiltrados.length === 0 || contatosFiltrados.includes(id)) }
    };
  }

  if (isGroup === "false") {
    whereCondition = {
      ...whereCondition,
      isGroup: false
    };
  }

  const attributes: any = [
    "id", "name", "number", "email", "profilePicUrl",
    "isGroup", "urlPicture", "active", "companyId", "channel",
    [literal(`(select name from "Users" u2 where id = "Contact"."createdBy")`), 'createdByName'],
    [literal(`(
        select u.name
        from "Tickets" t
        join "Users" u on u.id = t."userId"
        where 
          t."contactId" = "Contact".id and
          t."userId" = ${user.id}
        order by t."updatedAt" desc
        limit 1
      )`), 'sellerName'],
      [literal(`(
        select t.id
        from "Tickets" t
        where 
          t."contactId" = "Contact".id and
          t."userId" = ${user.id}
        order by t."updatedAt" desc
        limit 1
      )`), 'sellerTicketId'],
      [literal(`(
        select 
          w."name"
        from "Tickets" t
        left join "Whatsapps" w on w.id = t."whatsappId"
        where 
          t."contactId" = "Contact".id and
          t."userId" = ${user.id}
        order by t."updatedAt" desc
        limit 1
      )`), 'sellerConection']
  ];

  const limit = 100;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    attributes,
    limit,
    offset,
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name"]
      }
    ],
    order: [["name", "ASC"]],
    logging: console.log
  });

  const hasMore = count > offset + contacts.length;

  return {
    contacts,
    count,
    hasMore
  };
};


export default ListContactsService;
