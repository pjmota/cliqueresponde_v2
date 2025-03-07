import AppError from "../../errors/AppError";
import AfterSales from "../../models/AfterSales";
import AfterSalesDetails from "../../models/AfterSalesDetails";
import Contact from "../../models/Contact";

const ShowAfterSalesService = async (
  id: string | number,
  companyId: number
): Promise<AfterSales> => {
  const data = await AfterSales.findByPk(id, {
    include: [
      {
        model: AfterSalesDetails,
        attributes: [
          "id",
          "name",
          "value",
          "afterSalesId",
          "createdAt",
          "updatedAt",
          "mediaPath"
        ]
      },
      {
        model: Contact,
        attributes: [
          "id",
          "name",
          "number",
          "email"
        ]
      }
    ]
  });

  if (data?.companyId !== companyId) {
    throw new AppError("Não é possível excluir registro de outra empresa");
  }

  if (!data) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return data;
};

export default ShowAfterSalesService;
