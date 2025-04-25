import path from "path";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import logger from "../../utils/logger";
import fs from "fs";

interface ExtraInfo {
  id?: number;
  name: string;
  value: string;
  image?: {
    name: string;
    file: string;
  }
}

const UpsertContactCustomFieldService = async(extraInfo: ExtraInfo[], contact: Contact, exclude = true) => {
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  await Promise.all(
    extraInfo.map(async (info: any) => {
      
      if (info.image) {
        const folder = path.resolve(publicFolder, `company${contact.companyId}`, "images", contact.id.toString());
        if(!fs.existsSync(folder)){
          fs.mkdirSync(folder, {recursive: true})
        }
        fs.writeFileSync(path.resolve(folder, info.value), Buffer.from(info.image?.split(',')[1], 'base64'));
      }
      await ContactCustomField.upsert({ ...info, contactId: contact.id });
    })
  );

  if (exclude) {
    await Promise.all(
      contact.extraInfo.map(async oldInfo => {
        const stillExists = extraInfo.findIndex(info => info.id === oldInfo.id);
  
        if (stillExists === -1) {
          await ContactCustomField.destroy({ where: { id: oldInfo.id } });
        }
      })
    );
  }
}

export default UpsertContactCustomFieldService;