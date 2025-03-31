import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";
import logger from "../../utils/logger";
import ScheduleTagIntegration from "../../models/ScheduleTagIntegration";

interface Request {
  name: string;
  color: string;
  kanban: string;
  companyId: number;
  timeLane?: number;
  nextLaneId?: number | null;
  greetingMessageLane?: string;
  rollbackLaneId?: number | null;
  whatsappId?: number | null;
  queueIntegrationId?: number | null;
}

const CreateService = async ({
  name,
  color = "#A4CCCC",
  kanban,
  companyId,
  timeLane = null,
  nextLaneId = null,
  greetingMessageLane = "",
  rollbackLaneId = null,
  whatsappId = null,
  queueIntegrationId = null
}: Request): Promise<Tag> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(3)
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const [tag] = await Tag.findOrCreate({
    where: { name, color, kanban, companyId },
    defaults: {
      name,
      color,
      kanban,
      companyId,
      timeLane,
      nextLaneId: String(nextLaneId) === "" ? null : nextLaneId,
      greetingMessageLane,
      rollbackLaneId: String(rollbackLaneId) === "" ? null : rollbackLaneId,
      whatsappId: String(whatsappId) === "" ? null : whatsappId,
      queueIntegrationId: String(queueIntegrationId) === "" ? null : queueIntegrationId
    }
  });

  if(kanban && tag.id && tag.nextLaneId && tag.queueIntegrationId && tag.companyId && tag.timeLane) {
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

    if(!scheduleTagIntegration) {
      await ScheduleTagIntegration.findOrCreate({
        where: {...params },
        defaults:{ ...params}
      })
    }
  }

  await tag.reload();

  return tag;
};

export default CreateService;
