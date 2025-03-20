import axios from "axios";
import Ticket from "../../models/Ticket";
import QueueIntegrations from "../../models/QueueIntegrations";
import logger from "../../utils/logger";

export const getTypebot = async (ticket: Ticket, integration: QueueIntegrations) => {
  let isCompleted = false
  const typebotId = ticket.typebotId
  const token = ticket?.typebotToken
  const url = ticket?.typebotUrl
  const resultId = ticket.typebotResultId
  if (!token && !url && integration) {
    await ticket.update({
        typebotToken: integration?.typebotToken,
        typebotUrl: integration?.typebotUrlServer,
      })
  }

  if (typebotId && resultId && url && token) {
    const configResult = {
      method: 'get',
      url: `${url}/api/v1/typebots/${typebotId}/results/${resultId}`,
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
      }
    };
    //const requestResult = await axios.request(configResult) as any

    let requestResult;
    if (!configResult?.url) {
      logger.error("Erro: URL da requisição está indefinida ou vazia.");
      return
    } else {
      try {
        requestResult = await axios.request(configResult);
        logger.info(`Sucesso no axios request:", ${JSON.stringify(requestResult.data)}`);
      } catch (error) {
        if (error.response?.status === 404) {
          logger.warn(`Aviso: A URL retornou 404. Requisição não realizada. ${JSON.stringify(configResult)}`);
          return
        } else {
          logger.error(`Erro inesperado:", ${JSON.stringify(error)}`);
          return
        }
      }
    }
    const typebotResponse = requestResult.data

    if (typebotResponse.result.isCompleted && 
      typebotResponse.result.id === resultId) {

      
      await ticket.update({
          chatbot: false,
          useIntegration: false,
          integrationId: null,
          typebotSessionId: null,
          typebotToken: null,
          typebotId: null,
          typebotResultId: null,
          typebotUrl: null
        })
      isCompleted = true
    }
  }
  return isCompleted
}