import { Op } from "sequelize";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import logger from "../../utils/logger";

const ListContactCustomFieldService = async (companyId: number) => {
  const data = await ContactCustomField.findAll({
    include: [{
      model: Contact,
      attributes: ["id", "name", "number"],
      where: {
        companyId
      }
    }],
    where: {
      [Op.and]: [
        {value: {[Op.ne]: null}},
        {value: {[Op.ne]: ''}}
      ]
    },
    order:[["contactId", "asc"], ["name", "asc"]]
  });

  const res = {};
  const columns = [];

  data.forEach(item => {
    if(!res[item.contactId]) {
      res[item.contactId] = {
        contactId: item.contact.id,
        contactName: item.contact.name,
        contactNumber: item.contact.number
      }

      columns.push(...[
        'contactId',
        'contactName',
        'contactNumber'
      ])
    }

    if (!columns.some(column => column === item.name)) {
      columns.push(item.name);
    }

    res[item.contactId][item.name] = item.value;
  });

  return {columns, data: Object.values(res)};
}

export default ListContactCustomFieldService;