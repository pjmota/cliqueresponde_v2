import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ScheduleTagIntegration from "../../models/ScheduleTagIntegration";

interface ScheduleTagIntegrationData {
  tagId: number;
  nextTagId?: number;
  queueIntegrationId: number;
  delay: number;
  companyId: number;
  whatsappIds: number[];
}

const CreateScheduleTagIntegrationService = async (
  data: ScheduleTagIntegrationData
): Promise<ScheduleTagIntegration> => {
  const { tagId, nextTagId, queueIntegrationId, delay, companyId, whatsappIds } = data;

  const schema = Yup.object().shape({
    tagId: Yup.string().required("ERR_TAG_IS_REQUIRED"),
    queueIntegrationId: Yup.string().required(
      "ERR_QUEUE_INTEGRATION_IS_REQUIRED"
    ),
    delay: Yup.string().required("ERR_SCHEDULED_AT_IS_REQUIRED")
  });

  try {
    await schema.validate({ tagId, queueIntegrationId, delay });
  } catch (err) {
    throw new AppError(`${JSON.stringify(err.message)}`);
  }

  const scheduleTagIntegration =  await ScheduleTagIntegration.create({tagId, nextTagId, queueIntegrationId, delay, companyId});

  await scheduleTagIntegration.$set("whatsapps", whatsappIds);

  return scheduleTagIntegration;
};

export default CreateScheduleTagIntegrationService;
