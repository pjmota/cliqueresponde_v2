import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import ScheduleTagIntegration from "../../models/ScheduleTagIntegration";

const DeleteService = async (id: string | number, companyId?: string | number): Promise<void> => {
  const tag = await Tag.findOne({
    where: { id }
  });

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  const scheduleTagIntegration = await ScheduleTagIntegration.findOne({
    where: { tagId: tag.id , companyId: tag.companyId }
  });
  
  await tag.destroy();

  if(scheduleTagIntegration) {
    await scheduleTagIntegration.destroy()
  }
};

export default DeleteService;
