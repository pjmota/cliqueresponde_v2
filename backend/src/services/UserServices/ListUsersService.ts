import { Sequelize, Op } from "sequelize";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import User from "../../models/User";
import Plan from "../../models/Plan";
import Ticket from "../../models/Ticket";
import logger from "../../utils/logger";
import Tag from "../../models/Tag";
import Permission from "../../models/Permission";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  profile?: string;
  companyId?: number;
  limitNull?: boolean;
}

interface Response {
  users: User[];
  count: number;
  hasMore: boolean;
}

const ListUsersService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId,
  limitNull
}: Request): Promise<Response> => {
  const whereCondition = {
    [Op.or]: [
      {
        "$User.name$": Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("User.name")),
          "LIKE",
          `%${searchParam.toLowerCase()}%`
        )
      },
      { email: { [Op.like]: `%${searchParam.toLowerCase()}%` } }
    ],
    companyId: {
      [Op.eq]: companyId
    }
  };

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: users } = await User.findAndCountAll({
    where: whereCondition,
    attributes: [
      "name",
      "id",
      "email",
      "companyId",
      "profile",
      "online",
      "startWork",
      "endWork",
      "profileImage",
      "scheduleSendAt",
      "scheduleNotifyBeforeText",
      "scheduleNotifyBefore",
      "scheduleNotifyNowText",
      "daysUntilNextScheduleNotify"
    ],
    limit: limitNull ? null : limit,
    offset,
    order: [["name", "ASC"]],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
      { model: Tag, as: "tags", attributes: ["id", "name", "color"] },
      {
        model: Permission,
        as: "permissions",
        attributes: ["id", "name", "code"]
      },
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "dueDate", "document"]
      }
    ],
    //logging: console.log
  });

  const hasMore = count > offset + users.length;

  return {
    users,
    count,
    hasMore
  };
};

export default ListUsersService;
