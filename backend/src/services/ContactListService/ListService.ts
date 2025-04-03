import { Op, fn, col, where } from "sequelize";
import ContactList from "../../models/ContactList";
import ContactListItem from "../../models/ContactListItem";
import { isEmpty } from "lodash";
import removeAccents from "remove-accents"
import User from "../../models/User";
interface Request {
  companyId: number | string;
  userId?: number | string;
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  records: ContactList[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId,
  userId
}: Request): Promise<Response> => {
  let whereCondition: any = {
    companyId,
    ...(userId ? {userId} : {})
  };

  if (!isEmpty(searchParam)) {
    const sanitizedSearchParam = removeAccents(searchParam.toLocaleLowerCase().trim());

    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          name: where(
            fn("LOWER", fn('unaccent',col("ContactList.name"))),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        }
      ]
    };
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: records } = await ContactList.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    subQuery: false,
    include: [
      {
        model: ContactListItem,
        as: "contacts",
        attributes: [],
        required: false
      },
      { model: User, attributes: ["id", "name"] }
    ],
    attributes: [
      "id",
      "name",
      [fn("count", col("contacts.id")), "contactsCount"]
    ],
    group: ["ContactList.id", "user.id"],
    //logging: console.log
  });

  const hasMore = count > offset + records.length;

  return {
    records,
    count,
    hasMore
  };
};

export default ListService;
