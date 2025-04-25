import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import logger from "../../utils/logger";

const checker = async (number: string, wbot: any) => {
  const validNumber = await wbot.onWhatsApp(`${number}@s.whatsapp.net`);
  return validNumber;
};

const checkerGroup = async (number: string, wbot: any) => {
  try {
    const validGroup = await wbot.groupMetadata(`${number}@g.us`);
    return validGroup;
  } catch (error){
    if (error.message.includes("not found")) {
      throw new AppError("ERR_GROUP_NOT_FOUND");
    }
    console.error('Error checking group:', error);
    throw new AppError("ERR_CHECK_GROUP");
  }
};

const CheckContactNumber = async (
  number: string, companyId: number, isGroup: boolean = false, userId?: number
): Promise<string> => {
  const whatsappList = await GetDefaultWhatsApp(companyId, userId);

  if (whatsappList.channel === "whatsapp_oficial") {
    return number;
  }

  const wbot = getWbot(whatsappList.id);

  let numberArray;

  if (isGroup) {
    const grupoMeta = await checkerGroup(number, wbot);
    numberArray = [
      {
        ...grupoMeta,
        jid: grupoMeta.id,
        exists: true
      }
    ];
  } else {
    numberArray = await checker(number, wbot);
  }

  const isNumberExit = numberArray;

  if (!isNumberExit[0]?.exists) {
    throw new AppError("Este número não está cadastrado no whatsapp");
  }

  return isGroup ? number.split("@")[0] : isNumberExit[0].jid.split("@")[0];
};

export default CheckContactNumber;
