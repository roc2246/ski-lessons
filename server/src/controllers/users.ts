import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";

export async function manageUserRetrieval(req: unknown, res: utilities.ErrorResponseWriter) {
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

export async function manageGetUsers(req: { params?: { userId?: string } }, res: utilities.ErrorResponseWriter) {
  try {
    const { userId } = req.params ?? {};
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
