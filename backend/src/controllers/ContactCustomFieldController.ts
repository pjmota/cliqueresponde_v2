import { Request, Response } from "express";
import ListContactCustomFieldService from "../services/ContactCustomFieldService/ListContactCustomFieldService";
import UpdateStatusContactCustomFieldService from "../services/ContactCustomFieldService/UpdateStatusContactCustomFieldService";
import logger from "../utils/logger";
import UpsertContactCustomFieldService from "../services/ContactCustomFieldService/UpsertContactCustomFieldService";
import ShowContactService from "../services/ContactServices/ShowContactService";

export const index = async (
  req: Request,
  res: Response
) => {
  const { companyId, id } = req.user;
  const data = await ListContactCustomFieldService(companyId);
  return res.status(200).json(data);
}

export const store = async (
  req: Request,
  res: Response
) => {
  const { companyId, id } = req.user;
  const { contactId, extraInfo } = req.body;

  const contact = await ShowContactService(contactId, companyId);
  const data = await UpsertContactCustomFieldService(extraInfo, contact, false);

  return res.status(200).json(data);
}

export const patch = async (
  req: Request,
  res: Response
) => {
  const { contactId } = req.params;
  const { statusId } = req.body;
  const data = await UpdateStatusContactCustomFieldService(contactId, statusId);
  return res.status(200).json(data);
}