import QueueIntegrations from "../../models/QueueIntegrations"
import Ticket from "../../models/Ticket"

export const validFunction = (split: any, fromMe: boolean, ticket: Ticket) => {
  let valid = {
    valid: false,
    split: false
  }
  if (split.length > 1 || 
    (!ticket.chatbot && 
      (ticket.useIntegration || ticket.fromMe))) valid.valid = true

  if (split.length > 1) valid.split = true
  return valid
}

export const validShowIntegration = (response: any, fromMe: boolean, ticket: Ticket) => {
  let valid = { valid: false }
  if (ticket.integrationId &&
        ((
          !response?.queueIntegrations && 
          !fromMe && ticket.useIntegration) || 
          (!ticket.useIntegration && fromMe
        ))
      ) valid.valid = true
  return valid
}

export const validTypeBot = (
  response: any, 
  integrations: QueueIntegrations, 
  fromMe: boolean, 
  ticket: Ticket, 
  word: any,
  isCompleted: boolean
) => {
  let valid = { valid: false }
  // console.log('ticket.useIntegration', ticket.useIntegration)
  // console.log('response.queueIntegrations', response.queueIntegrations)
  // console.log('!fromMe', fromMe)
  // console.log('!word', word)
  // console.log('integrations?.typebotKeywordStart', integrations?.typebotKeywordStart)
  // console.log('word', word)
  // console.log('!isCompleted', word)
  if (
    (ticket.useIntegration || response.queueIntegrations) 
    && (integrations && ((!fromMe && !word) 
      || integrations?.typebotKeywordStart === word)
    && !isCompleted)
  ) valid.valid = true
  return valid
}