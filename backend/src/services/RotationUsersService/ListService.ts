import { Op, Sequelize } from "sequelize";
import RotationUsers from "../../models/RotationUsers";

interface Request {
  searchParam?: {
    sequence?: number;
    rotationId?: number;
    userId?: number;
  };
  rotationId?: number;
}

interface Response {
  rotationUsers: RotationUsers[];
  count: number;
  hasMore: boolean;
}

const ListRotationUsersService = async ({
  searchParam,
  rotationId
}: Request): Promise<Response> => {
  let whereCondition = {};
  const limit = 20;
console.log('searchParam', searchParam)

  whereCondition = {
    ...whereCondition,
    rotationId: {
      [Op.eq]: rotationId
    }
  }

  if(searchParam) {
    if(searchParam.sequence) {
      whereCondition = {
        ...whereCondition,
        sequence: {
          [Op.eq]: searchParam.sequence
        }
      }
    }

    if(searchParam.rotationId) {
      whereCondition = {
        ...whereCondition,
        rotationId: {
          [Op.eq]: searchParam.rotationId
        }
      }
    }
  }

  const { count, rows: rotationUsers } = await RotationUsers.findAndCountAll({
    where: whereCondition,
    limit,
    order: [["createdAt", "ASC"]],
    //logging: console.log
  });

  const hasMore = count > 100 + rotationUsers.length;

  return {
    rotationUsers,
    count,
    hasMore
  };
};

export default ListRotationUsersService;
