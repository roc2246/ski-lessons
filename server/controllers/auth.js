import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";
import jwt from "jsonwebtoken";

function getUserFromRequest(req) {
  if (req.user) return req.user;

  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function manageNewUser(req, res) {
  try {
    await models.dbConnect();

    const { username, password, admin } = req.body;
    await models.newUser(username, password, admin);
    res.status(201).json({ message: `${username} registered` });
  } catch (error) {
    utilities.sendError(res, 400, "Failed to register user", error);
  }
}

export async function manageLogin(req, res) {
  try {
    const { username, password } = req.body;
    const token = await models.loginUser(username, password);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    utilities.sendError(res, 401, "Login failed", error);
  }
}

export async function manageLogout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.sendError(res, 401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];
    const blacklist = models.createTokenBlacklist();
    await models.logoutUser(blacklist, token);
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    utilities.sendError(res, 500, "Logout failed", error);
  }
}

export async function decodeUser(req, res) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return utilities.sendError(res, 401, "Unauthorized: No token provided");
    }

    const exposedCredentials = {
      userId: user.userId,
      username: user.username,
      admin: user.admin,
    };
    res.status(200).json({
      message: `Retrieved credentials for ${exposedCredentials.username}`,
      credentials: exposedCredentials,
    });
  } catch (error) {
    utilities.sendError(res, 500, "Failed to retrieve credentials", error);
  }
}

export async function selfDeleteAccount(req, res) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return utilities.sendError(res, 401, "Unauthorized: No token provided");
    }

    const username = user.username;
    const id = user.userId;

    const lessons = await models.retrieveLessons({ assignedTo: id });
    for (const lesson of lessons) {
      await models.switchLessonAssignment(lesson._id.toString(), null);
    }

    await models.deleteUser(username);

    res.status(200).json({ message: `User "${username}" deleted successfully` });
  } catch (error) {
    console.log(error);
    utilities.sendError(res, 500, "Failed to delete user", error);
  }
}
