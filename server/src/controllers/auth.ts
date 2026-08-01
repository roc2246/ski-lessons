import type { Request, Response } from "express";
import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";

interface AuthRequestBody {
  username: string;
  password: string;
}

function parseAuthRequestBody(body: unknown): AuthRequestBody {
  const raw = (typeof body === "object" && body !== null) ? (body as Record<string, unknown>) : {};
  const username = typeof raw.username === "string" ? raw.username : "";
  const password = typeof raw.password === "string" ? raw.password : "";

  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  return { username, password };
}

export async function manageNewUser(req: Request, res: Response) {
  try {
    const { username, password } = parseAuthRequestBody(req.body);
    await models.newUser(username, password, false);
    res.status(201).json({ message: `${username} registered` });
  } catch (error) {
    utilities.sendError(res, 400, "Failed to register user", error);
  }
}

export async function manageLogin(req: Request, res: Response) {
  try {
    const { username, password } = parseAuthRequestBody(req.body);
    const token = await models.loginUser(username, password);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    utilities.sendError(res, 401, "Login failed", error);
  }
}

export async function manageLogout(req: Request, res: Response) {
  try {
    if (typeof req.token !== "string") {
      throw new Error("Invalid token");
    }
    await models.logoutUser(req.token);
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    utilities.sendError(res, 500, "Logout failed", error);
  }
}

export async function decodeUser(req: Request, res: Response) {
  try {
    const { userId, username, admin } = req.user ?? { userId: "", username: "", admin: false };
    res.status(200).json({
      message: `Retrieved credentials for ${username}`,
      credentials: { userId, username, admin },
    });
  } catch (error) {
    utilities.sendError(res, 500, "Failed to retrieve credentials", error);
  }
}

export async function selfDeleteAccount(req: Request, res: Response) {
  try {
    const { username, userId } = req.user ?? {};
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
  try {
    const { userId } = req.user ?? {};
    const users = await models.getUsers(typeof userId === "string" ? userId : undefined);
    res.status(200).json({ message: "Users retrieved successfully", users });
  } catch (error) {
    utilities.sendError(res, 500, "Failed to retrieve users", error);
  }
}
