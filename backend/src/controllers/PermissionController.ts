import { Request, Response } from "express";
import ListService from "../services/PermissionService/ListService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
  kanban?: number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;

  const { permissions, count, hasMore } = await ListService({
    searchParam,
    pageNumber
  });

  return res.json({ permissions, count, hasMore });
};
