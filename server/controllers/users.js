import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";

export async function manageUserRetrieval(req, res) {
  try {
    const users = await models.retrieveUsers();
    res.status(200).json({
      message: `Users retrieved`,
      users,
    });
  } catch (error) {
    utilities.sendError(res, 400, "Failed to retrieve users", error);
  }
}
