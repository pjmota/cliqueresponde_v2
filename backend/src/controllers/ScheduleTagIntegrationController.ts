import { Request, Response } from "express";
import ListScheduleTagIntegrationsService from "../services/ScheduleTagIntegration/ListScheduleTagIntegrationService";
import CreateScheduleTagIntegrationService from "../services/ScheduleTagIntegration/CreateScheduleTagIntegrationService";
import ShowScheduleTagIntegrationService from "../services/ScheduleTagIntegration/ShowScheduleTagIntegrationService";
import UpdateScheduleTagIntegrationService from "../services/ScheduleTagIntegration/UpdateScheduleTagIntegrationService";
import DeleteScheduleTagIntegrationService from "../services/ScheduleTagIntegration/DeleteScheduleTagIntegrationService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;
  const { rows, count, hasMore } = await ListScheduleTagIntegrationsService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.status(200).json({ rows, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { tagId, nextTagId, queueIntegrationId, delay, whatsappIds } = req.body;

  const data = await CreateScheduleTagIntegrationService({
    tagId,
    nextTagId,
    queueIntegrationId,
    delay,
    companyId,
    whatsappIds
  });

  return res.status(200).json(data);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const prompt = await ShowScheduleTagIntegrationService({ id, companyId });

  return res.status(200).json(prompt);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const data = req.body;

  const prompt = await UpdateScheduleTagIntegrationService({
    data,
    id: +id,
    companyId
  });

  return res.status(200).json(prompt);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteScheduleTagIntegrationService(id, companyId);

  return res.status(200).json({ message: "ScheduleTagIntegration deleted" });
};
