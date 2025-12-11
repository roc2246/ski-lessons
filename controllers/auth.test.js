import { describe, it, expect, vi, beforeEach } from "vitest";
import * as controllers from "../controllers/auth.js";
import jwt from "jsonwebtoken";
import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";

// Mock response helper
const createRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// Mock request helper
const createReq = (body = {}, headers = {}, params = {}) => ({
  body,
  headers,
  params,
});

// Mock external libraries
vi.mock("jsonwebtoken", () => ({ default: { sign: vi.fn(), verify: vi.fn() } }));
vi.mock("../models/index.js", async () => {
  const actual = await vi.importActual("../models/index.js");
  return {
    ...actual,
    newUser: vi.fn(),
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
    createTokenBlacklist: vi.fn(() => ({ add: vi.fn() })),
    retrieveLessons: vi.fn(),
    switchLessonAssignment: vi.fn(),
    deleteUser: vi.fn(),
  };
});
vi.mock("../utilities/index.js", async () => {
  const actual = await vi.importActual("../utilities/index.js");
  return { ...actual, httpErrorMssg: vi.fn() };
});

beforeEach(() => vi.clearAllMocks());

// ========== decodeUser tests ==========
describe("decodeUser", () => {
  let req, res;

  beforeEach(() => {
    req = createReq({}, { authorization: "Bearer faketoken" });
    res = createRes();
  });

  it("should respond 200 with exposed credentials (no password)", async () => {
    const decodedToken = { userId: "user123", username: "demoUser", admin: true };
    jwt.verify.mockReturnValueOnce(decodedToken);

    await controllers.decodeUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Retrieved credentials for demoUser",
      credentials: decodedToken,
    });
  });

  it("should respond 401 if Authorization header missing", async () => {
    req.headers.authorization = undefined;
    await controllers.decodeUser(req, res);
    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(res, 401, "Unauthorized: No token provided");
  });
});

// ========== manageNewUser tests ==========
describe("manageNewUser", () => {
  it("should respond with 201 on success", async () => {
    models.newUser.mockResolvedValueOnce();
    const req = createReq({ username: "user", password: "pass" });
    const res = createRes();

    await controllers.manageNewUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "user registered" });
  });
});

// ========== manageLogin tests ==========
describe("manageLogin", () => {
  it("should respond 200 with token on success", async () => {
    models.loginUser.mockResolvedValueOnce("token123");
    const req = createReq({ username: "user", password: "pass" });
    const res = createRes();

    await controllers.manageLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Login successful", token: "token123" });
  });
});

// ========== manageLogout tests ==========
describe("manageLogout", () => {
  it("should logout successfully", async () => {
    const addMock = vi.fn();
    models.createTokenBlacklist.mockReturnValueOnce({ add: addMock });
    models.logoutUser.mockImplementationOnce(async (blacklist, token) => blacklist.add(token));

    const req = createReq({}, { authorization: "Bearer token123" });
    const res = createRes();

    await controllers.manageLogout(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Successfully logged out" });
  });
});

// ========== selfDeleteAccount tests ==========
describe("selfDeleteAccount", () => {
  let req, res;

  beforeEach(() => {
    req = createReq({}, { authorization: "Bearer faketoken" });
    res = createRes();
  });

  it("should delete user successfully", async () => {
    jwt.verify.mockReturnValueOnce({ username: "user", userId: "uid123" });
    models.retrieveLessons.mockResolvedValueOnce([]);
    models.switchLessonAssignment.mockResolvedValue();
    models.deleteUser.mockResolvedValueOnce({ username: "user" });

    await controllers.selfDeleteAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User "user" deleted successfully' });
  });
});
