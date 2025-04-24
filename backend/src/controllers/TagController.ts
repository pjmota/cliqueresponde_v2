import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";

import CreateService from "../services/TagServices/CreateService";
import ListService from "../services/TagServices/ListService";
import UpdateService from "../services/TagServices/UpdateService";
import ShowService from "../services/TagServices/ShowService";
import DeleteService from "../services/TagServices/DeleteService";
import SimpleListService from "../services/TagServices/SimpleListService";
import SyncTagService from "../services/TagServices/SyncTagsService";
import KanbanListService from "../services/TagServices/KanbanListService";
import ContactTag from "../models/ContactTag";
import logger from "../utils/logger";
import SyncTagLanesService from "../services/TagServices/SyncTagLaneService";
import Tag from "../models/Tag";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
  totalPage?: string | number;
  kanban?: number;
  tagId?: number;
  paramTag?: string;
  sequence?: number;
};

async function obtemUltimoNumeroDaSequencia(
  companyId: number,
  kanban: number

): Promise<number> {
  let itemCount= await Tag.count({
    where: {
      companyId,
      kanban
    }
  });

  //veja se existe algum item com o mesmo numero de sequencia
  while (await Tag.findOne({ where: { companyId, kanban, sequence: itemCount } }) && itemCount > 0) {
    itemCount++;
  }
  return itemCount > 0 ? itemCount : 1;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, totalPage, searchParam, kanban, tagId, paramTag } = req.query as IndexQuery;
  const { companyId } = req.user;
  const { tags, count, hasMore } = await ListService({
    searchParam,
    pageNumber,
    companyId,
    kanban,
    tagId,
    ...(paramTag ? {paramTag: JSON.parse(paramTag)} : {}),
    ...(paramTag ? {totalPage} : {})
  });

  return res.json({ tags, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    color,
    kanban,
    timeLane,
    nextLaneId,
    greetingMessageLane,
    rollbackLaneId,
    whatsappId,
    queueIntegrationId,
    sequence
  } = req.body;
  const { companyId } = req.user;

  
  
  
  const lastSequenceNumber = await obtemUltimoNumeroDaSequencia(
    companyId,
    kanban
  );
  

  const tag = await CreateService({
    name,
    color,
    kanban,
    companyId,
    timeLane,
    nextLaneId,
    greetingMessageLane,
    rollbackLaneId,
    whatsappId,
    queueIntegrationId: queueIntegrationId ?? null,
    sequence: sequence ?? lastSequenceNumber
    
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company${companyId}-tag`, {
    action: "create",
    tag
  });

  return res.status(200).json(tag);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { tagId } = req.params;

  const tag = await ShowService(tagId);

  return res.status(200).json(tag);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { kanban } = req.body;

  if (req.user.profile !== "admin" && kanban === 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { tagId } = req.params;
  const tagData = req.body;
  const { companyId } = req.user;

  const tag = await UpdateService({ tagData, id: tagId });

  const io = getIO();
  io.of(String(companyId)).emit(`company${companyId}-tag`, {
    action: "update",
    tag
  });

  return res.status(200).json(tag);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tagId } = req.params;
  const { companyId } = req.user;

  await DeleteService(tagId, companyId);

  const io = getIO();
  io.of(String(companyId)).emit(`company${companyId}-tag`, {
    action: "delete",
    tagId
  });

  return res.status(200).json({ message: "Tag deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, kanban } = req.query as IndexQuery;
  const { companyId } = req.user;

  const tags = await SimpleListService({ searchParam, kanban, companyId });

  return res.json(tags);
};

export const kanban = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const tags = await KanbanListService({ companyId });

  return res.json({ lista: tags });
};

export const syncTags = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body;
  const { companyId } = req.user;

  const tags = await SyncTagService({ ...data, companyId });

  return res.json(tags);
};

export const syncTagsLane = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body;
  const { companyId } = req.user;

  const tags = await SyncTagLanesService({ ...data, companyId });

  return res.json(tags);
};

export const removeContactTag = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tagId, contactId } = req.params;
  const { companyId } = req.user;

  await ContactTag.destroy({
    where: {
      tagId,
      contactId
    }
  });

  const tag = await ShowService(tagId);

  const io = getIO();
  io.of(String(companyId)).emit(`company${companyId}-tag`, {
    action: "update",
    tag
  });

  return res.status(200).json({ message: "Tag deleted" });
};
