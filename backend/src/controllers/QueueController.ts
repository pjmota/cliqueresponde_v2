import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateQueueService from "../services/QueueService/CreateQueueService";
import DeleteQueueService from "../services/QueueService/DeleteQueueService";
import ListQueuesService from "../services/QueueService/ListQueuesService";
import ShowQueueService from "../services/QueueService/ShowQueueService";
import UpdateQueueService from "../services/QueueService/UpdateQueueService";
import { isNil } from "lodash";
<<<<<<< HEAD
import logger from "../utils/logger";
import UpdateRotationService from "../services/RotationsService/UpdateService";
=======
>>>>>>> organizacional/main

type QueueFilter = {
  companyId: number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId: userCompanyId } = req.user;
  const { companyId: queryCompanyId } = req.query as unknown as QueueFilter;
  let companyId = userCompanyId;

  if (!isNil(queryCompanyId)) {
    companyId = +queryCompanyId;
  }

  const queues = await ListQueuesService({ companyId });

  return res.status(200).json(queues);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    color,
    greetingMessage,
    outOfHoursMessage,
    schedules,
    chatbots,
<<<<<<< HEAD
    orderQueue,
    tempoRoteador,
=======
    orderQueue, 
    tempoRoteador, 
>>>>>>> organizacional/main
    ativarRoteador,
    integrationId,
    fileListId,
    closeTicket
  } = req.body;
  const { companyId } = req.user;

  const queue = await CreateQueueService({
    name,
    color,
    greetingMessage,
    companyId,
<<<<<<< HEAD
    outOfHoursMessage,
    tempoRoteador: tempoRoteador === "" ? 0 : tempoRoteador,
    ativarRoteador,
    schedules,
    chatbots,
=======
    outOfHoursMessage, 
    tempoRoteador: tempoRoteador ===""? 0 : tempoRoteador, 
    ativarRoteador,
    schedules,
    chatbots, 
>>>>>>> organizacional/main
    orderQueue: orderQueue === "" ? null : orderQueue,
    integrationId: integrationId === "" ? null : integrationId,
    fileListId: fileListId === "" ? null : fileListId,
    closeTicket
  });

  const io = getIO();
<<<<<<< HEAD
  io.of(String(companyId)).emit(`company-${companyId}-queue`, {
=======
  io.of(String(companyId))
  .emit(`company-${companyId}-queue`, {
>>>>>>> organizacional/main
    action: "update",
    queue
  });

  return res.status(200).json(queue);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;

  const queue = await ShowQueueService(queueId, companyId);

  return res.status(200).json(queue);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;

  const {
    name,
    color,
    greetingMessage,
    outOfHoursMessage,
    schedules,
    chatbots,
<<<<<<< HEAD
    orderQueue,
    tempoRoteador,
    ativarRoteador,
    integrationId,
    fileListId,
    closeTicket,
    lastSequence,
    rotationId
  } = req.body;

  const queue = await UpdateQueueService(
    queueId,
    {
      name,
      color,
      greetingMessage,
      outOfHoursMessage,
      tempoRoteador: tempoRoteador === "" ? 0 : tempoRoteador,
      ativarRoteador,
      schedules,
      chatbots,
      orderQueue: orderQueue === "" ? null : orderQueue,
      integrationId: integrationId === "" ? null : integrationId,
      fileListId: fileListId === "" ? null : fileListId,
      closeTicket
    },
    companyId
  );

  if(lastSequence) {
    await UpdateRotationService({
      rotationData: {
        lastSequence,
        queueId: queue.id,
        companyId
      }, 
      id: rotationId
    })
  }

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-queue`, {
=======
    orderQueue, 
    tempoRoteador, 
    ativarRoteador,
    integrationId,
    fileListId,
    closeTicket
  } = req.body;

  const queue = await UpdateQueueService(queueId, 
    {name,
    color,
    greetingMessage,
    outOfHoursMessage, 
    tempoRoteador: tempoRoteador ===""? 0 : tempoRoteador, 
    ativarRoteador,
    schedules,
    chatbots, 
    orderQueue: orderQueue === "" ? null : orderQueue,
    integrationId: integrationId === "" ? null : integrationId,
    fileListId: fileListId === "" ? null : fileListId,
    closeTicket},
    companyId);

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-queue`, {
>>>>>>> organizacional/main
    action: "update",
    queue
  });

  return res.status(201).json(queue);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;

  await DeleteQueueService(queueId, companyId);

  const io = getIO();
<<<<<<< HEAD
  io.of(String(companyId)).emit(`company-${companyId}-queue`, {
=======
  io.of(String(companyId))
  .emit(`company-${companyId}-queue`, {
>>>>>>> organizacional/main
    action: "delete",
    queueId: +queueId
  });

  return res.status(200).send();
};
