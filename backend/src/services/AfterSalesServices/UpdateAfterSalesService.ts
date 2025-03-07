import AfterSales from "../../models/AfterSales";
import CreateAfterSalesDetailsService from "../AfterSalesDetailsService/CreateAfterSalesDetailsService";
import DeleteAfterSalesDetailsByAfterSalesIdService from "../AfterSalesDetailsService/DeleteAfterSalesDetailsByAfterSalesIdService";
import UpdateContactService from "../ContactServices/UpdateContactService";

type Data = {
  contact: {
    id: string;
    name: string;
    number: string;
    email: string;
  },
  details: {
    id: string;
    name: string
    value: string
  }[]
}

const UpdateAfterSalesService = async (id: string, companyId: number, data: Data, userId: string) => {
  const afterSales = await AfterSales.findByPk(id);

  await afterSales.update(data);

  if (data.contact?.id) {
    await UpdateContactService({
      contactData: data.contact,
      contactId: data.contact.id,
      companyId
    });
  }

  const details = data.details ?? [];

  await DeleteAfterSalesDetailsByAfterSalesIdService(afterSales.id);
  await CreateAfterSalesDetailsService(details, afterSales.id, userId);

  await afterSales.reload();

  return afterSales;
}

export default UpdateAfterSalesService;