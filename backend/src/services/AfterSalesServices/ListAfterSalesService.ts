import { literal, Op } from "sequelize";
import AfterSales from "../../models/AfterSales";
import Contact from "../../models/Contact";
import User from "../../models/User";

interface Request {
  contactId: string;
  searchParam: string;
  dateStart: string;
  dateEnd: string;
  status: string[];
  pageNumber: string;
}

const ListAfterSalesService = async (
  companyId: number,
  userId: string,
  params: Request
) => {
  const {
    contactId,
    searchParam,
    dateStart,
    dateEnd,
    status,
    pageNumber = "1"
  } = params;

  let where: any = {
    companyId
  };

  const user = await User.findByPk(userId);

  if (!user.isAfterSalesManager) {
    where = { ...where, createdBy: userId };
  }

  let include: any = [];

  include.push({ model: Contact, attributes: ["id", "name", "number"] });

  if (searchParam) {
    include = [
      ...include,
      {
        model: Contact,
        where: {
          [Op.or]: {
            name: {
              [Op.iLike]: `%${searchParam}%`
            },
            number: {
              [Op.iLike]: `%${searchParam}%`
            }
          }
        }
      }
    ];
  }

  if (contactId) {
    where = { ...where, contactId };
  }

  if (status?.length && !status.includes("TODOS")) {
    where = { ...where, status: { [Op.in]: status } };
  }

  if (dateStart) {
    where = { ...where, updatedAt: { [Op.gte]: dateStart } };
  }

  if (dateEnd) {
    where = { ...where, updatedAt: { [Op.lte]: dateEnd } };
  }

  if (dateStart && dateEnd) {
    where = { ...where, updatedAt: { [Op.between]: [dateStart, dateEnd] } };
  }

  const attributes: any = [
    "id",
    "status",
    "updatedAt",
    "createdAt",
    [
      literal(
        `(select value from "AfterSalesDetails" asd where name = 'OBSPOSVENDA' and asd."afterSalesId" = "AfterSales"."id" limit 1)`
      ),
      "OBSPOSVENDA"
    ],
    [
      literal(
        `(select name from "Users" u where u.id = "AfterSales"."createdBy")`
      ),
      "sellerName"
    ],
    [
      literal(
        `(select count(1) from "AfterSalesDetails" asd where asd."afterSalesId" = "AfterSales"."id" and asd."name" ilike 'img%' and (asd."value" is not null and asd.value != ''))`
      ),
      "images"
    ],
    [
      literal(
        `(select count(1) from "AfterSalesDetails" asd where asd."afterSalesId" = "AfterSales"."id" and asd."name" not ilike 'img%' and (asd."value" is not null and asd.value != ''))`
      ),
      "filledDetails"
    ]
  ];

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: afterSales } = await AfterSales.findAndCountAll({
    where,
    attributes,
    include,
    limit,
    offset,
    order: [["updatedAt", "desc"]],
    logging: console.log
  });

  const hasMore = count > offset + afterSales.length;

  return { afterSales, hasMore, count };
};

export default ListAfterSalesService;
