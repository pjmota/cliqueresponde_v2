import { Op, Sequelize } from "sequelize";
import Rotations from "../../models/Rotations";

interface Request {
  queueId?: number;
  companyId?: number;
  lastSequence?: number;
}

interface Response {
  rotations: Rotations[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  queueId,
  companyId,
  lastSequence
}: Request): Promise<Response> => {
  let whereCondition = {};
  const limit = 20;


  whereCondition = {
    ...whereCondition,
    companyId: {
      [Op.eq]: companyId
    }
  }

  if(queueId) {
    whereCondition = {
      ...whereCondition,
      queueId: {
        [Op.eq]: queueId
      }
    }
  }

  if(lastSequence) {
    whereCondition = {
      ...whereCondition,
      lastSequence: {
        [Op.eq]: lastSequence
      }
    }
  }

  const { count, rows: rotations } = await Rotations.findAndCountAll({
    where: whereCondition,
    limit,
    order: [["createdAt", "DESC"]],
    //logging: console.log
  });

  const hasMore = count > 100 + rotations.length;

  return {
    rotations,
    count,
    hasMore
  };
};

export default ListService;
