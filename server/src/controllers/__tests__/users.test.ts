import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../services/index.js", async () => {
  const actual = await vi.importActual<typeof import("../../services/index.js")>("../../services/index.js");
  return { ...actual, retrieveUsers: vi.fn(), getUser: vi.fn() };
});

vi.mock("../../utilities/index.js", async () => {
  const actual = await vi.importActual<typeof import("../../utilities/index.js")>("../../utilities/index.js");
  return { ...actual, sendError: vi.fn() };
});

import * as controllers from "../users.js";
import * as services from "../../services/index.js";
import * as utilities from "../../utilities/index.js";

const createRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => vi.clearAllMocks());

describe("manageUserRetrieval", () => {
  it("retrieves all users", async () => {
    const fakeUsers = [{ username: "user1" }, { username: "user2" }];
    (services.retrieveUsers as any).mockResolvedValueOnce(fakeUsers);
    const req: any = {};
    const res = createRes();

    await controllers.manageUserRetrieval(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Users retrieved", users: fakeUsers });
  });
});

describe("manageGetUsers", () => {
  it("retrieves a single user by id", async () => {
    const user = { username: "user1" };
    (services.getUser as any).mockResolvedValueOnce(user);
    const req: any = { params: { userId: "123" } };
    const res = createRes();

    await controllers.manageGetUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "User retrieved", user });
  });
});
