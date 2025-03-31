import LogRoulette from "../../models/LogRolette";

interface Request {
  ticketId: number;
  userId: number;
  userName: string;
  rotationId: number;
  sequence: number;
  lastSequence: number;
  companyId: number;
  companyName: string;
  queueId: number;
  queueName: string;
  queueRouletteActive: boolean;
  contactId: number;
  contactName: string;
  contactNumber: string;
  whatsappId: number;
  whatsappName: string;
  origin: string;
}

const CreateLogRotationService = async ({
  ticketId,
  userId,
  userName,
  rotationId,
  sequence,
  lastSequence,
  companyId,
  companyName,
  queueId,
  queueName,
  queueRouletteActive,
  contactId,
  contactName,
  contactNumber,
  whatsappId,
  whatsappName,
  origin,
}: Request): Promise<void> => {
  await LogRoulette.create({
    ticketId,
    userId,
    userName,
    rotationId,
    sequence,
    lastSequence,
    companyId,
    companyName,
    queueId,
    queueName,
    queueRouletteActive,
    contactId,
    contactName,
    contactNumber,
    whatsappId,
    whatsappName,
    origin,
  });
};

export default CreateLogRotationService;