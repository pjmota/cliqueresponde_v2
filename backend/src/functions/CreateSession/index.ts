import { WASocket } from "@whiskeysockets/baileys";
import { Store } from "../../libs/store";
import Ticket from "../../models/Ticket";
import ShowQueueIntegrationService from "../../services/QueueIntegrationServices/ShowQueueIntegrationService";
import { handleMessageIntegration } from "../../services/WbotServices/wbotMessageListener";
import ListQueueIntegrationService from "../../services/QueueIntegrationServices/ListQueueIntegrationService";
import { validFunction, validShowIntegration, validTypeBot } from "./validations";
import { getTypebot } from "./getTypebot";
import logger from "../../utils/logger";

type Session = WASocket & {
    id?: number;
    store?: Store;
  };
  

export const handleGetAndSendMessageIntegration = async (
    msg: any,
    wbot: Session,
    ticket: Ticket,
    companyId: number,
    bodyMessage?: any

  ): Promise<void> => {
    const split = bodyMessage.split('*')
    const vF = validFunction(split, msg.key.fromMe, ticket);
    
    if (vF.valid) {
      let result = split[2];
      let word = ''
      let response = [] as any

      if (vF.split) word = result.replace(/\n/g,"");
      if (word) {
        response = await ListQueueIntegrationService({
          typebotKeywordStart: word, companyId
        });
      } 

      const vI = validShowIntegration(response, msg.key.fromMe, ticket);

      if (vI.valid) {
        response = await ShowQueueIntegrationService(
          ticket.integrationId, companyId
        );
      }
      const integrations = response.queueIntegrations  
      ? response.queueIntegrations[0]  
      : response

      const isCompletedValid = await getTypebot(ticket, integrations);
      const isCompleted = isCompletedValid ?? null;
      const vT = validTypeBot(response, integrations, msg.key.fromMe, ticket, word, isCompleted)

      if (vT.valid) {
        await handleMessageIntegration(msg, wbot, integrations, ticket, companyId)
      }
    } 
  }