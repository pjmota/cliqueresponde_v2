import ScheduleTagIntegration from "../../models/ScheduleTagIntegration";
import ShowScheduleTagIntegrationService from "./ShowScheduleTagIntegrationService";

interface ScheduleTagIntegrationData {
  tagId: number;
  nextTagId?: number;
  queueIntegrationId: number;
  delay: number;
  companyId: number;
  whatsappIds: number[];
}

interface Request {
  data: ScheduleTagIntegrationData;
  id: number;
  companyId: string | number;
}

const UpdateScheduleTagIntegrationService = async ({
  id,
  data,
  companyId
}: Request): Promise<ScheduleTagIntegration | undefined> => {
  const { tagId, nextTagId, queueIntegrationId, delay, whatsappIds } = data;

  const scheduleTagIntegration = await ShowScheduleTagIntegrationService({
    id,
    companyId
  });

  await scheduleTagIntegration.update({
    tagId,
    nextTagId,
    queueIntegrationId,
    delay
  });

  await scheduleTagIntegration.$set("whatsapps", whatsappIds);

  await scheduleTagIntegration.reload();

  return scheduleTagIntegration;
};

export default UpdateScheduleTagIntegrationService;
