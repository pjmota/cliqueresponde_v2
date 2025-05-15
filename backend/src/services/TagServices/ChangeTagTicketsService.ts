import { Op } from "sequelize";
import TicketTag from "../../models/TicketTag";
import logger from "../../utils/logger";
import Company from "../../models/Company";
import LogTransferTicketsTag from "../../models/LogTransferTicketsTag";

interface Request {
  ticketIds?: string;
  user: User;
  nextTag: number;
  currentTag: number;
  screenInfo?: string;
}

interface User {
  id: string;
  profile: string;
  companyId: number;
}


const ChangeTagTickets = async ({
  ticketIds,
  user,
  nextTag,
  currentTag,
  screenInfo
}: Request) => {

  const ticketIdArray = ticketIds.split(",").map(id => parseInt(id.trim(), 10));

  await TicketTag.update(
    { tagId: nextTag },
    {
      where: {
        ticketId: {
          [Op.in]: ticketIdArray
        }
      }
    }
  );

  await LogTransferTicketsTag.create({
    currentTagId: currentTag,
    nextTagId: nextTag,
    tickets: ticketIds,
    userId: user.id,
    companyId: user.companyId,
    screenInfo
  });

}

export default ChangeTagTickets;