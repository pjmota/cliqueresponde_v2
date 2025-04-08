import { Op, literal, fn, col } from "sequelize";
import Tag from "../../models/Tag";
import Permission from "../../models/Permission";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  permissions: Permission[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam,
  pageNumber = "1"
}: Request): Promise<Response> => {
  let whereCondition = {};
  const limit = 5000;
  const offset = limit * (+pageNumber - 1);

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${searchParam}%` } },
        { color: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  const { count, rows: permissions } = await Permission.findAndCountAll({
    where: { ...whereCondition },
    limit,
    offset,
    order: [["name", "ASC"]],
  });

  const hasMore = count > offset + permissions.length;

  return {
    permissions,
    count,
    hasMore
  };
};

export default ListService;
