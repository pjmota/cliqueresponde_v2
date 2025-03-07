import AppError from "../../errors/AppError";
import ListAfterSalesDetailsService from "../AfterSalesDetailsService/ListAfterSalesDetailsService";
import DeleteAfterSalesDetailsService from "../AfterSalesDetailsService/DeleteAfterSalesDetailsService";
import AfterSales from "../../models/AfterSales";

const DeleteAfterSalesService = async (id: string): Promise<void> => {
  const record = await AfterSales.findOne({
    where: { id }
  });

  if (!record) {
    throw new AppError("ERR_NO_AFTER_SALES_FOUND", 404);
  }

  const childs = await ListAfterSalesDetailsService(id);

  await DeleteAfterSalesDetailsService(childs.map(item => item.id));

  await record.destroy();
};

export default DeleteAfterSalesService;
