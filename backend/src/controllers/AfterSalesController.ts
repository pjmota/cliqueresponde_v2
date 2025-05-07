import { Request, Response } from "express"
import ListAfterSalesService from "../services/AfterSalesServices/ListAfterSalesService"
import CreateAfterSalesService from "../services/AfterSalesServices/CreateAfterSalesService";
import UpdateAfterSalesService from "../services/AfterSalesServices/UpdateAfterSalesService";
import ShowAfterSalesService from "../services/AfterSalesServices/ShowAfterSalesService";
import DeleteAfterSalesService from "../services/AfterSalesServices/DeleteAfterSalesService";
import logger from "../utils/logger";

interface IndexQuery {
  contactId: string,
  searchParam: string,
  pageNumber: string,
  dateStart: string,
  dateEnd: string,
  status: string
}

export const index = async (req: Request, res: Response) => {
  const { companyId, id } = req.user;
  const { contactId, searchParam, pageNumber, dateStart, dateEnd, status } = req.query as unknown as IndexQuery;

  const data = await ListAfterSalesService(companyId, id, { contactId, searchParam, pageNumber, dateStart, dateEnd, status: status ? JSON.parse(status) : [] });

  return res.status(200).json(data);
}

export const show = async (req: Request, res: Response) => {
  const { afterSalesId } = req.params;
  const { companyId, id } = req.user;

  const contact = await ShowAfterSalesService(afterSalesId, companyId);

  return res.status(200).json(contact);
}

export const store = async (req: Request, res: Response) => {
  const { companyId, id } = req.user;
  const data  = req.body;

  const afterSales = await CreateAfterSalesService(data, companyId, id);
  logger.warn(`afterSales ----- ${JSON.stringify(afterSales)}`)
  return res.status(200).json(afterSales);
}

export const update = async (req: Request, res: Response) => {
  const { afterSalesId } = req.params;
  const { companyId, id } = req.user;

  const data = req.body;

  const afterSales = await UpdateAfterSalesService(afterSalesId, companyId, {...data, createdBy: id }, id);

  return res.status(200).json(afterSales);
}

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { afterSalesId } = req.params;
  const { companyId } = req.user;

  await DeleteAfterSalesService(afterSalesId);

  return res.status(200).json();
};