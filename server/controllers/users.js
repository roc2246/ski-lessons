import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";

export async function manageUserRetrieval(req, res) {
  try {
    // req.user is attached by authenticate middleware
    // requireAdmin middleware ensures user.admin === true
    const users = await models.retrieveUsers();
    res.status(200).json({
      message: `Users retrieved`,
      users,
    });
  } catch (error) {
    utilities.sendError(res, 500, "Failed to retrieve users", error);
  }
}

export async function manageGetUsers(req, res) {
  try {
    const { userId } = req.params;
    const user = await models.getUser(userId);

    res.status(200).json({
      message: "User retrieved",
      user,
    });
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    utilities.sendError(res, status, "Failed to retrieve user", error);
  }
}
