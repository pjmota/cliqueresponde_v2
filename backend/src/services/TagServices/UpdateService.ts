import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";
import ShowService from "./ShowService";
import ScheduleTagIntegration from "../../models/ScheduleTagIntegration";
import logger from "../../utils/logger";

interface TagData {
  id?: number;
  name?: string;
  color?: string;
  kanban?: number;
  timeLane?: number;
  nextLaneId?: number;
  greetingMessageLane: string;
  rollbackLaneId?: number;
  whatsappId?: number;
  queueIntegrationId?: number;
  sequence?: number;
}

interface Request {
  tagData: TagData;
  id: string | number;
}

const UpdateUserService = async ({
  tagData,
  id
}: Request): Promise<Tag | undefined> => {
  const tag = await ShowService(id);

  const schema = Yup.object().shape({
    name: Yup.string().min(3)
  });

  const { name, color, kanban,
    timeLane,
    nextLaneId = null,
    greetingMessageLane,
    rollbackLaneId = null,
    whatsappId = null,
    queueIntegrationId = null,
    sequence = null
  } = tagData;

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await tag.update({
    name,
    color,
    kanban,
    timeLane,
    nextLaneId: String(nextLaneId) === "" ? null : nextLaneId,
    greetingMessageLane,
    rollbackLaneId: String(rollbackLaneId) === "" ? null : rollbackLaneId,
    whatsappId,
    queueIntegrationId,
    sequence: sequence ? sequence : 0
  });

  if(kanban) {
    const params = {
      tagId: tag.id ,	
      nextTagId: tag.nextLaneId,	
      queueIntegrationId: tag.queueIntegrationId,	
      companyId: tag.companyId,	
      delay: tag.timeLane 
    }

    const scheduleTagIntegration = await ScheduleTagIntegration.findOne({
      where: { tagId: tag.id , companyId: tag.companyId }
    });

    if(scheduleTagIntegration) {
      const record = await ScheduleTagIntegration.findByPk(scheduleTagIntegration.id);
      await record.update(params);
    } else {
      await ScheduleTagIntegration.findOrCreate({
        where: {...params },
        defaults:{ ...params}
      })
    }
  }

  await tag.reload();
  return tag;
};

export default UpdateUserService;
