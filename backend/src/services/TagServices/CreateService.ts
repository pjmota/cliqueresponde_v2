import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";
<<<<<<< HEAD
import logger from "../../utils/logger";
import ScheduleTagIntegration from "../../models/ScheduleTagIntegration";
=======
>>>>>>> organizacional/main

interface Request {
  name: string;
  color: string;
  kanban: string;
  companyId: number;
  timeLane?: number;
<<<<<<< HEAD
  nextLaneId?: number | null;
  greetingMessageLane?: string;
  rollbackLaneId?: number | null;
  whatsappId?: number | null;
  queueIntegrationId?: number | null;
=======
  nextLaneId?: number;
  greetingMessageLane?: string;
  rollbackLaneId?: number;
>>>>>>> organizacional/main
}

const CreateService = async ({
  name,
  color = "#A4CCCC",
  kanban,
  companyId,
  timeLane = null,
  nextLaneId = null,
  greetingMessageLane = "",
<<<<<<< HEAD
  rollbackLaneId = null,
  whatsappId = null,
  queueIntegrationId = null
=======
  rollbackLaneId = null
>>>>>>> organizacional/main
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
<<<<<<< HEAD
      name,
      color,
      kanban,
      companyId,
=======
      name, color, kanban, companyId,
>>>>>>> organizacional/main
      timeLane,
      nextLaneId: String(nextLaneId) === "" ? null : nextLaneId,
      greetingMessageLane,
      rollbackLaneId: String(rollbackLaneId) === "" ? null : rollbackLaneId,
<<<<<<< HEAD
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

=======
    }
  });

>>>>>>> organizacional/main
  await tag.reload();

  return tag;
};

export default CreateService;
