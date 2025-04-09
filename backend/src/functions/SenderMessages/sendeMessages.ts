import axios from "axios"
import ShowUserService from "../../services/UserServices/ShowUserService"
import Ticket from "../../models/Ticket"
import logger from "../../utils/logger";
import User from "../../models/User";

export const senderMessages = async (userId: string | number, userNumber?: any, messages?: any, ticket?: Ticket) => {
  try { 

    const user = await User.findByPk(userId);

    let _message: string;

    if (!messages && user.leadMessage) {
      _message = user.leadMessage;
    } else if (!messages) {
      _message = 'Novo contato no CRM Clique Responde';
    }

    if (!messages && user.sendWhatsAppInLeadMessage === 'enable') {
      _message += `: https://wa.me/${ticket.contact.number}`;
    }

    const data = {
      token: user?.tokenWhats,
      number: userNumber ?? user?.userWhats,
      message: _message
    }

    if (!data.token || !data.number || user.sendWhatsAppInLeadMessage === 'disable') return

    await axios.post(`${process.env.WHATSAPP_API}`,
      {
        number: data.number,
        body: data.message
      },
      {
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        }
      }
    )

    } catch (error) {
      logger.error(`[senderMessages] (user: ${userId}) ${JSON.stringify(error)}`)
    }
    
  }