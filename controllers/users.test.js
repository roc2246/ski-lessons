import { describe, it, expect, vi, beforeEach } from "vitest";
import * as controllers from "../controllers/users.js";
import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";

const createRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const createReq = (body = {}, headers = {}, params = {}) => ({ body, headers, params });

vi.mock("../models/index.js", async () => {
  const actual = await vi.importActual("../models/index.js");
  return { ...actual, retrieveUsers: vi.fn() };
});
vi.mock("../utilities/index.js", async () => {
  const actual = await vi.importActual("../utilities/index.js");
  return { ...actual, sendError: vi.fn() };
});

beforeEach(() => vi.clearAllMocks());

describe("manageUserRetrieval", () => {
  it("should retrieve all users successfully", async () => {
    const fakeUsers = [{ username: "user1" }, { username: "user2" }];
    models.retrieveUsers.mockResolvedValueOnce(fakeUsers);

    const req = createReq();
    const res = createRes();

    await controllers.manageUserRetrieval(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Users retrieved", users: fakeUsers });
  });

  it("should call sendError on failure", async () => {
    const err = new Error("fail");
    models.retrieveUsers.mockRejectedValueOnce(err);

    const req = createReq();
    const res = createRes();

    await controllers.manageUserRetrieval(req, res);

    expect(utilities.sendError).toHaveBeenCalledWith(res, 400, "Failed to retrieve users", err);
  });
});
