import type { Request, Response } from "express";
import * as services from "../services/index.js";
import { sendError } from "../utilities/errors.js";
import { getErrorStatus } from "../utilities/type-guards.js";

function getRouteParam(value: string | string[] | undefined, paramName: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(`Missing or invalid ${paramName}`);
  }

  return value;
}

export async function manageUserRetrieval(_req: Request, res: Response): Promise<void> {
  try {
    const users = await services.getUsers();
    res.status(200).json({
      message: "Users retrieved",
      users,
    });
  } catch (error) {
    sendError(res, 500, "Failed to retrieve users", error);
  }
}

export async function manageGetUsers(req: Request, res: Response): Promise<void> {
  try {
    const userId = getRouteParam(req.params.userId, "userId");
    const user = await services.getUser(userId);

    res.status(200).json({
      message: "User retrieved",
      user,
    });
  } catch (error) {
    const status = getErrorStatus(error);
    sendError(res, status ?? 500, "Failed to retrieve user", error);
  }
}
