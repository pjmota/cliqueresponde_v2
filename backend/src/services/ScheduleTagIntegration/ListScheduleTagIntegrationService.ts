import { Op } from "sequelize";
import ScheduleTagIntegration from "../../models/ScheduleTagIntegration";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import QueueIntegrations from "../../models/QueueIntegrations";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  companyId: string | number;
}

interface Response {
  rows: ScheduleTagIntegration[];
  count: number;
  hasMore: boolean;
}

const ListScheduleTagIntegrationsService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId
}: Request): Promise<Response> => {
  let whereCondition = {};
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows } = await ScheduleTagIntegration.findAndCountAll({
    where: { ...whereCondition, companyId },
    include: [
      { model: Tag, as: "tag", foreignKey: "tagId", attributes: ['id', 'name'] },
      { model: Tag, as: "nextTag", foreignKey: "nextTagId", attributes: ['id', 'name'] },
      { model: QueueIntegrations, as: "queueIntegration", attributes: ['id', 'name'] }
    ],
    limit,
    offset,
    order: [["id", "DESC"]],
    //logging: console.log
  });

  const hasMore = count > offset + rows.length;

  return {
    rows,
    count,
    hasMore
  };
};

export default ListScheduleTagIntegrationsService;
