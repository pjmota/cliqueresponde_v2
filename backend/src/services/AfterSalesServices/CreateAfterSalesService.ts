import AfterSales from "../../models/AfterSales";
import CreateAfterSalesDetailsService from "../AfterSalesDetailsService/CreateAfterSalesDetailsService";
import CreateContactService from "../ContactServices/CreateContactService";
import ShowContactByNumberService from "../ContactServices/ShowContactByNumberService";

type Data = {
  contact: {
    name: string;
    number: string;
    email: string;
  },
  details: {name: string, value: string}[]
}

const CreateAfterSalesService = async (data: Data, companyId: number, userId: string) => {
  const status = 'POS_VENDA_PENDENTE';

  let contact = await ShowContactByNumberService(data.contact.number, companyId);
  
  if (!contact) {
    contact = await CreateContactService({ ...data.contact, companyId, userId });
  }

  const afterSales = await AfterSales.create({ contactId: contact.id, companyId, status, createdBy: userId });

  if (data.details) {
    await CreateAfterSalesDetailsService(data.details, afterSales.id, userId);
  }

  return afterSales;
}

export default CreateAfterSalesService;