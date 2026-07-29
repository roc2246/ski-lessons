import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../models/index.js", async () => {
  const actual = await vi.importActual<typeof import("../../models/index.js")>("../../models/index.js");
  return {
    ...actual,
    newUser: vi.fn(),
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
    unassignAllLessons: vi.fn(),
    deleteUser: vi.fn(),
    getUsers: vi.fn(),
  };
});

vi.mock("../../utilities/index.js", async () => {
  const actual = await vi.importActual<typeof import("../../utilities/index.js")>("../../utilities/index.js");
  return { ...actual, sendError: vi.fn() };
});

import * as controllers from "../auth.js";
import * as models from "../../models/index.js";
import * as utilities from "../../utilities/index.js";

const createRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const createReq = (body: Record<string, unknown> = {}, params: Record<string, string> = {}) => ({ body, params });

beforeEach(() => vi.clearAllMocks());

describe("decodeUser", () => {
  it("returns the authenticated user credentials", async () => {
    const req: any = { user: { userId: "user123", username: "demoUser", admin: true } };
    const res = createRes();

    await controllers.decodeUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Retrieved credentials for demoUser",
      credentials: { userId: "user123", username: "demoUser", admin: true },
    });
  });
});

describe("manageNewUser", () => {
  it("creates a user and returns 201", async () => {
    (models.newUser as any).mockResolvedValueOnce(undefined);
    const req = createReq({ username: "user", password: "pass" });
    const res = createRes();

    await controllers.manageNewUser(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "user registered" });
  });
});

describe("manageLogin", () => {
  it("returns a token when login succeeds", async () => {
    (models.loginUser as any).mockResolvedValueOnce("token123");
    const req = createReq({ username: "user", password: "pass" });
    const res = createRes();

    await controllers.manageLogin(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Login successful", token: "token123" });
  });
});

describe("manageLogout", () => {
  it("logs out the current token", async () => {
    (models.logoutUser as any).mockResolvedValueOnce(undefined);
    const req: any = { token: "token123" };
    const res = createRes();

    await controllers.manageLogout(req, res);

    expect(models.logoutUser).toHaveBeenCalledWith("token123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Successfully logged out" });
  });
});

describe("selfDeleteAccount", () => {
  it("deletes the user account and unassigns lessons", async () => {
    (models.unassignAllLessons as any).mockResolvedValueOnce(undefined);
    (models.deleteUser as any).mockResolvedValueOnce({ username: "user" });
    const req: any = { user: { username: "user", userId: "uid123" } };
    const res = createRes();

    await controllers.selfDeleteAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User "user" deleted successfully' });
  });
});

describe("manageGetUsers", () => {
  it("returns the list of users for the current authenticated user", async () => {
    (models.getUsers as any).mockResolvedValueOnce([{ username: "user" }]);
    const req: any = { user: { userId: "uid123" } };
    const res = createRes();

    await controllers.manageGetUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Users retrieved successfully", users: [{ username: "user" }] });
  });
});
