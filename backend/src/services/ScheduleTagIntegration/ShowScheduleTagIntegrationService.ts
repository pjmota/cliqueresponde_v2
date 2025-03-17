import AppError from "../../errors/AppError";
import ScheduleTagIntegration from "../../models/ScheduleTagIntegration";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import QueueIntegrations from "../../models/QueueIntegrations";
import Whatsapp from "../../models/Whatsapp";

interface Data {
  id: string | number;
  companyId: string | number;
}
const ShowScheduleTagIntegrationService = async ({
  id,
  companyId
}: Data): Promise<ScheduleTagIntegration> => {
  const row = await ScheduleTagIntegration.findOne({
    include: [
      { model: Tag, as: "tag", attributes: ["id", "name"] },
      { model: Tag, as: "nextTag", attributes: ["id", "name"] },
      { model: QueueIntegrations, as: "queueIntegration", attributes: ["id", "name"] },
      { model: Whatsapp, as: "whatsapps", attributes: ["id", "name"] },
    ],
    where: {
      id,
      companyId
    }
  });

  if (!row) {
    throw new AppError("ERR_NO_ROW_FOUND", 404);
  }

  return row;
};

export default ShowScheduleTagIntegrationService;
