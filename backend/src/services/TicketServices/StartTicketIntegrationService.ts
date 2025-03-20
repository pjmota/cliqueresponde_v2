import { getWbot } from "../../libs/wbot";
import logger from "../../utils/logger";
import ShowQueueIntegrationService from "../QueueIntegrationServices/ShowQueueIntegrationService";
import typebotListener from "../TypebotServices/typebotListener";
import ShowTicketService from "./ShowTicketService";

const StartTicketIntegrationService = async (
  id: number,
  companyId: number,
  integrationId: number
) => {
  const ticket = await ShowTicketService(id, companyId);

  await ticket.update({
    promptId: null,
    integrationId: null,
    useIntegration: false,
    typebotStatus: false,
    typebotSessionId: null,
    chatbot: false,
    typebotToken: null,
    typebotId: null,
    typebotResultId: null,
    typebotUrl: null
  });

  await ticket.reload();

  //const ticket = await ShowTicketService(id, companyId);

  const queueIntegration = await ShowQueueIntegrationService(
    integrationId,
    companyId
  );

  const whatsappId = queueIntegration.whatsappId ?? ticket.whatsappId;

  const wbot = getWbot(whatsappId);
  const remoteJid = `${ticket.contact.number}@s.whatsapp.net`;

  const msg = {
    key: {
      remoteJid
    },
    message: {
      extendedTextMessage: {}
    }
  };

  await typebotListener({ wbot, msg, ticket, typebot: queueIntegration });
};

export default StartTicketIntegrationService;
