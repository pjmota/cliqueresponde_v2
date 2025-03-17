import ShowScheduleTagIntegrationService from "./ShowScheduleTagIntegrationService";

const DeleteScheduleTagIntegrationService = async (id: number | string, companyId: number | string): Promise<void> => {
  const row = await ShowScheduleTagIntegrationService({ id, companyId });

  await row.destroy();
};

export default DeleteScheduleTagIntegrationService;
