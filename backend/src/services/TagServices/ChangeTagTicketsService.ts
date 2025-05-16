import { Op } from "sequelize";
import TicketTag from "../../models/TicketTag";
import logger from "../../utils/logger";
import Company from "../../models/Company";
import LogTransferTicketsTag from "../../models/LogTransferTicketsTag";
import ContactTag from "../../models/ContactTag";

interface Request {
  paramsId?: string;
  user: User;
  nextTag: number;
  currentTag: number;
  screenInfo?: number;
}

interface User {
  id: string;
  profile: string;
  companyId: number;
}


const ChangeTagTickets = async ({
  paramsId,
  user,
  nextTag,
  currentTag,
  screenInfo
}: Request) => {

  const idsArray = paramsId.split(",").map(id => parseInt(id.trim(), 10));

  if(screenInfo === 1) {
    await TicketTag.update(
      { tagId: nextTag },
      {
        where: {
          ticketId: {
            [Op.in]: idsArray
          }
        }
      }
    );
  } else {
    await ContactTag.update(
      { tagId: nextTag },
      {
        where: {
          contactId: {
            [Op.in]: idsArray
          }
        }
      }
    )
  }

  await LogTransferTicketsTag.create({
    currentTagId: currentTag,
    nextTagId: nextTag,
    ...(screenInfo === 1 ? {tickets: paramsId} : {contacts: paramsId}),
    userId: user.id,
    companyId: user.companyId,
    screenInfo: screenInfo === 1 ? 'Lane page' : 'Tag page'
  });

}

export default ChangeTagTickets;