import AfterSalesDetails from "../../models/AfterSalesDetails";
import { randomUUID } from "crypto";
import ShowUserService from "../UserServices/ShowUserService";
import path from "path";
import fs from "fs";
import downloadFileFromUrl from "../../utils/downloadFileFromUrl";
import logger from "../../utils/logger";

type Details = {
  name: string;
  value: string;
  image?: string;
  mediaPath?: string;
}[];

const CreateAfterSalesDetailsService = async (
  details: Details,
  afterSalesId: number,
  userId
) => {
  const user = await ShowUserService(userId);
  const userFields = user.contactCustomFields
    .split(";")
    .map(name => ({ name: name.trim(), value: "" }));

  const data = details.concat(
    userFields.filter(field => userFields.every(_field => _field !== field))
  );

  await AfterSalesDetails.bulkCreate(
    data.map(item => ({
      ...item,
      name: item.name.trim(),
      afterSalesId,
      id: `${randomUUID()}`
    }))
  );

  details.forEach(async item => {
    try {
      const folder = path.resolve(
        process.env.ASSETS_DIRECTORY,
        "images",
        "aftersales",
        afterSalesId.toString()
      );

      if (item.image || item.mediaPath) {
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
        }
      }

      if (item.image) {
        fs.writeFileSync(
          path.resolve(folder, item.value),
          Buffer.from(item.image?.split(",")[1], "base64")
        );
      }

      if (item.mediaPath) {
        await downloadFileFromUrl(
          item.mediaPath,
          path.resolve(folder, item.value)
        );
      }
    } catch (error) {
      logger.error(`[CreateAfterSalesDetailsService] ${error.message}`);
    }
  });
};

export default CreateAfterSalesDetailsService;
