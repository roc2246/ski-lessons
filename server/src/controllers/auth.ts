import type { Request, Response } from "express";
import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";

export async function manageNewUser(req: Request, res: Response) {
  const authReq = req as Request & { body?: { username?: unknown; password?: unknown } };

  try {
    const { username, password } = authReq.body ?? {};
    await models.newUser(username as string, password as string, false);
    res.status(201).json({ message: `${username} registered` });
  } catch (error) {
    utilities.sendError(res, 400, "Failed to register user", error);
  }
}

export async function manageLogin(req: Request, res: Response) {
  const authReq = req as Request & { body?: { username?: unknown; password?: unknown } };

  try {
    const { username, password } = authReq.body ?? {};
    const token = await models.loginUser(username as string, password as string);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    utilities.sendError(res, 401, "Login failed", error);
  }
}

export async function manageLogout(req: Request, res: Response) {
  const authReq = req as Request & { token?: unknown };

  try {
    await models.logoutUser(authReq.token as string);
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    utilities.sendError(res, 500, "Logout failed", error);
  }
}

export async function decodeUser(req: Request, res: Response) {
  const authReq = req as Request & { user?: { userId?: string; username?: string; admin?: boolean } };

  try {
    const { userId, username, admin } = authReq.user ?? { userId: "", username: "", admin: false };
    res.status(200).json({
      message: `Retrieved credentials for ${username}`,
      credentials: { userId, username, admin },
    });
  } catch (error) {
    utilities.sendError(res, 500, "Failed to retrieve credentials", error);
  }
}

export async function selfDeleteAccount(req: Request, res: Response) {
  const authReq = req as Request & { user?: { username?: string; userId?: string } };

  try {
    const { username, userId } = authReq.user ?? {};
    if (!username || !userId) {
      throw new Error("User credentials missing");
    }

    await models.unassignAllLessons(userId);
    await models.deleteUser(username);
    res.status(200).json({ message: `User "${username}" deleted successfully` });
  } catch (error) {
    console.error(error);
    utilities.sendError(res, 500, "Failed to delete user", error);
  }
}

export async function manageGetUsers(req: Request, res: Response) {
  const authReq = req as Request & { user?: { userId?: string } };

  try {
    const { userId } = authReq.user ?? {};
    const users = await models.getUsers(userId as string);
    res.status(200).json({ message: "Users retrieved successfully", users });
  } catch (error) {
    utilities.sendError(res, 500, "Failed to retrieve users", error);
  }
}
