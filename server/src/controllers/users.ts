import type { Request, Response } from "express";
import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";

export async function manageUserRetrieval(_req: Request, res: Response) {
  try {
    const users = await models.retrieveUsers();
    res.status(200).json({
      message: "Users retrieved",
      users,
    });
  } catch (error) {
    utilities.sendError(res, 500, "Failed to retrieve users", error);
  }
}

export async function manageGetUsers(req: Request, res: Response) {
  const userReq = req as Request & { params?: { userId?: string } };

  try {
    const { userId } = userReq.params ?? {};
    const user = await models.getUser(userId as string);

    res.status(200).json({
      message: "User retrieved",
      user,
    });
  } catch (error) {
    const status = Number.isInteger((error as { status?: number })?.status) ? (error as { status?: number }).status : 500;
    utilities.sendError(res, status ?? 500, "Failed to retrieve user", error);
  }
}
