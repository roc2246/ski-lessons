import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";

export async function manageNewUser(req, res) {
  try {
    const { username, password } = req.body;
    await models.newUser(username, password, false);
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
    await models.logoutUser(req.token);
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    utilities.sendError(res, 500, "Logout failed", error);
  }
}

export async function decodeUser(req, res) {
  try {
    const { userId, username, admin } = req.user;
    res.status(200).json({
      message: `Retrieved credentials for ${username}`,
      credentials: { userId, username, admin },
    });
  } catch (error) {
    utilities.sendError(res, 500, "Failed to retrieve credentials", error);
  }
}

export async function selfDeleteAccount(req, res) {
  try {
    const { username, userId } = req.user;
    await models.unassignAllLessons(userId);
    await models.deleteUser(username);
    res.status(200).json({ message: `User "${username}" deleted successfully` });
  } catch (error) {
    console.error(error);
    utilities.sendError(res, 500, "Failed to delete user", error);
  }
}
