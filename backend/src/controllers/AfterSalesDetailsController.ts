import { Request, Response } from "express";
import ListAfterSalesDetailsService from "../services/AfterSalesDetailsService/ListAfterSalesDetailsService";

export const index = async (req: Request, res: Response) => {
  const { afterSalesId } = req.params;

  const data = await ListAfterSalesDetailsService(afterSalesId);

  return res.status(200).json(data);
}