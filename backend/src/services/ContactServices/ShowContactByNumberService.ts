import Contact from "../../models/Contact";
import { Op } from "sequelize";

const ShowContactByNumberService = async (
  number: string | number,
  companyId: number
): Promise<Contact> => {
  const contact = await Contact.findOne({where: {
    [Op.or]: {
        name: {
            [Op.iLike]: `%${number}%`
        },
        number: {
            [Op.iLike]: `%${number}%`
        }
    },
    companyId
  }});

  return contact;
};

export default ShowContactByNumberService;
