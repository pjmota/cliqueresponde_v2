import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { head } from "lodash";

import AppError from "../errors/AppError";

import CreateService from "../services/RotationUsersService/CreateService";
import ListService from "../services/RotationUsersService/ListService";
import ShowService from "../services/RotationUsersService/ShowService";
import UpdateService from "../services/RotationUsersService/UpdateService";
import DeleteService from "../services/RotationUsersService/DeleteService"
import logger from "../utils/logger";

type IndexQuery = {
  searchParam?: {
    sequence?: number;
    rotationId?: number;
    userId?: number;
  };
  rotationId?: string | number;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, rotationId: queryRotationId } = req.query as IndexQuery;
  const { companyId } = req.user;
  const { rotationId: bodyRotationId } = req.body;

  const { rotationUsers, count, hasMore } = await ListService({
    searchParam,
    rotationId: queryRotationId ? Number(queryRotationId) : bodyRotationId
  });

  return res.json({ rotationUsers, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { sequence, userId } = req.body;
  const { companyId } = req.user;
  const { rotationId } = req.body;

  const rotationUser = await CreateService({
    sequence,
    userId,
    rotationId
  });

  return res.status(200).json(rotationUser);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { rotationId } = req.params;
  const { companyId } = req.user;

  const rotationUser = await ShowService(rotationId);

  return res.status(200).json(rotationUser);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { rotationId } = req.params;
  const rotationUserData = req.body;

  const rotationUser = await UpdateService({ rotationUserData, id: rotationId });

  return res.status(200).json(rotationUser);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteService(Number(id));

  return res.status(200).json({ message: "Rotation deleted"});
}
