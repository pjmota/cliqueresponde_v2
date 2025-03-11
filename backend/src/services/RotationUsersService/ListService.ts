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

    if(searchParam.userId) {
      whereCondition = {
        ...whereCondition,
        userId: {
          [Op.eq]: searchParam.userId
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
