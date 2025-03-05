import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateService from "../services/RotationsService/CreateService";
import ListService from "../services/RotationsService/ListService";
import ShowService from "../services/RotationsService/ShowService";
import UpdateService from "../services/RotationsService/UpdateService";

import logger from "../utils/logger";
import CreateServiceUser from "../services/RotationUsersService/CreateService";
import ListRotationUsersService from "../services/RotationUsersService/ListService";
import UpdateUserService from "../services/RotationUsersService/UpdateService";


type IndexQuery = {
  queueId?: number;
  lastSequence?: number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { queueId, lastSequence } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { rotations, count, hasMore } = await ListService({
    queueId: Number(queueId),
    lastSequence: Number(lastSequence),
    companyId
  });
  
  return res.json({ rotations, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {

  try {
    const { queueId, rotationId, sequence, userId } = req.body;
    const { companyId } = req.user;
  
    const rotation = await CreateService({
      queueId,
      companyId,
      rotationId
    });
  
    if(rotation.id) {
      const searchParam = {
        sequence: Number(sequence),
        rotationId: rotation.id
      }
      const rotationId = rotation.id;
      const {rotationUsers} = await ListRotationUsersService({searchParam, rotationId});
  
      if(rotationUsers.length) {
        throw new AppError("ERR_CONFLICT_ROTATIONUSERS_FOUND", 409);
      }
  
      await CreateServiceUser({
        sequence,
        userId,
        rotationId: rotation.id
      })
    }
  
    return res.status(200).json(rotation);
  } catch (err) {
    throw new AppError(err.message);
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { rotationId } = req.params;
  const { companyId } = req.user;

  const rotation = await ShowService(rotationId);

  return res.status(200).json(rotation);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { id } = req.params;
  const rotationData = req.body;
  const { option } = req.body;
  const rotation = await UpdateService({rotationData, id: Number(id) });

  const searchParam = {
    userId: option.userId
  }

  const { rotationUsers } = await ListRotationUsersService({searchParam, rotationId: Number(id)});
  const rotationUserData = {
    sequence: Number(option.sequence),
    rotationId: Number(option.rotationId),
    userId: Number(option.userId),
  };

  await UpdateUserService({rotationUserData, id: rotationUsers[0].id})

  return res.status(200).json(rotation);
};
