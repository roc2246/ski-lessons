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
