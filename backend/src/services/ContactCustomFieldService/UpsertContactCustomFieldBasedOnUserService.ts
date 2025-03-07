import ShowUserService from "../UserServices/ShowUserService";
import UpsertContactCustomFieldService from "./UpsertContactCustomFieldService";
import ShowContactService from "../ContactServices/ShowContactService";


const UpsertContactCustomFieldBasedOnUserService = async(userId: string, contactId: string, companyId: number) => {
  const user = await ShowUserService(userId, companyId);
  const contact = await ShowContactService(contactId, companyId);

  if (user.contactCustomFields){
    const names = contact.extraInfo.map(item => item.name);

    const extraInfo = user.contactCustomFields.split(';')
    .map(name => ({ name: name.trim(), value: "" }))
    .filter(item => !names.includes(item.name) && item.name)
    .concat(JSON.parse(JSON.stringify(contact.extraInfo)));

    if (extraInfo.length) {
      await UpsertContactCustomFieldService(extraInfo, contact);
    }
  }

  return await ShowContactService(contactId, companyId);
}

export default UpsertContactCustomFieldBasedOnUserService;