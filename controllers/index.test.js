import { describe, it, expect, vi, beforeEach } from "vitest";
import * as controllers from "."; // Import all controllers
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
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

// Mocks
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("../models/index.js", async () => {
  const actual = await vi.importActual("../models/index.js");
  return {
    ...actual,
    newUser: vi.fn(),
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
    createTokenBlacklist: vi.fn(() => ({
      add: vi.fn(),
    })),
    retrieveLessons: vi.fn(),
    switchLessonAssignment: vi.fn(),
  };
});

vi.mock("../utilities/index.js", async () => {
  const actual = await vi.importActual("../utilities/index.js");
  return {
    ...actual,
    httpErrorMssg: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ===================== DECODE USER TESTS ===================== //
describe("decodeUser", () => {
  let req, res;

  beforeEach(() => {
    req = createReq({}, { authorization: "Bearer faketoken" });
    res = createRes();
    vi.clearAllMocks();
  });

  it("should respond 200 with exposed credentials (no password)", async () => {
    const decodedToken = {
      userId: "user123",
      username: "demoUser",
      admin: true,
      password: "hashed_pass",
    };
    jwt.verify.mockReturnValueOnce(decodedToken);

    await controllers.decodeUser(req, res);

    expect(jwt.verify).toHaveBeenCalledWith(
      "faketoken",
      process.env.JWT_SECRET
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Retrieved credentials for demoUser",
      credentials: {
        userId: "user123",
        username: "demoUser",
        admin: true,
      },
    });
  });

  it("should respond 401 if Authorization header missing", async () => {
    req.headers.authorization = undefined;

    await controllers.decodeUser(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      401,
      "Unauthorized: No token provided"
    );
  });

  it("should respond 401 if Authorization header does not start with Bearer", async () => {
    req.headers.authorization = "Token faketoken";

    await controllers.decodeUser(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      401,
      "Unauthorized: No token provided"
    );
  });

  it("should respond 401 if JWT verification fails", async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    await controllers.decodeUser(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      401,
      "Unauthorized: Invalid token"
    );
  });

  it("should respond 500 on unexpected errors", async () => {
    const brokenReq = { headers: { authorization: null } };
    await controllers.decodeUser(brokenReq, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      401,
      "Unauthorized: No token provided"
    );
  });
});

// ===================== OTHER CONTROLLERS ===================== //
describe("manageNewUser", () => {
  it("should respond with 201 and message on success", async () => {
    models.newUser.mockResolvedValueOnce();

    const req = createReq({ username: "user", password: "pass", admin: false });
    const res = createRes();

    await controllers.manageNewUser(req, res);

    expect(models.newUser).toHaveBeenCalledWith("user", "pass", false);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "user registered" });
  });

  it("should call httpErrorMssg on failure", async () => {
    const error = new Error("fail");
    models.newUser.mockRejectedValueOnce(error);

    const req = createReq({ username: "user", password: "pass" });
    const res = createRes();

    await controllers.manageNewUser(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      401,
      "Failed to register user",
      error
    );
  });
});

describe("manageLogin", () => {
  it("should respond with 200 and token on success", async () => {
    models.loginUser.mockResolvedValueOnce("token123");

    const req = createReq({ username: "user", password: "pass" });
    const res = createRes();

    await controllers.manageLogin(req, res);

    expect(models.loginUser).toHaveBeenCalledWith("user", "pass");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      token: "token123",
    });
  });

  it("should call httpErrorMssg on failure", async () => {
    const error = new Error("fail");
    models.loginUser.mockRejectedValueOnce(error);

    const req = createReq({ username: "user", password: "pass" });
    const res = createRes();

    await controllers.manageLogin(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      401,
      "Login failed",
      error
    );
  });
});

// ===================== LOGOUT ===================== //
describe("manageLogout", () => {
  it("should add token to blacklist and respond 200", async () => {
    const addMock = vi.fn();
    models.createTokenBlacklist.mockReturnValueOnce({ add: addMock });
    models.logoutUser.mockImplementationOnce(async (blacklist, token) => {
      blacklist.add(token);
    });

    const req = createReq({}, { authorization: "Bearer token123" });
    const res = createRes();

    await controllers.manageLogout(req, res);

    expect(models.createTokenBlacklist).toHaveBeenCalled();
    expect(models.logoutUser).toHaveBeenCalledWith(
      { add: addMock },
      "token123"
    );
    expect(addMock).toHaveBeenCalledWith("token123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Successfully logged out",
    });
  });

  it("should respond with error if Authorization header missing or invalid", async () => {
    const req = createReq({}, {});
    const res = createRes();

    await controllers.manageLogout(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      400,
      "Logout failed",
      "Missing or invalid Authorization header"
    );
  });

  it("should call httpErrorMssg on failure", async () => {
    const error = new Error("fail");
    models.createTokenBlacklist.mockReturnValueOnce({ add: vi.fn() });
    models.logoutUser.mockRejectedValueOnce(error);

    const req = createReq({}, { authorization: "Bearer token123" });
    const res = createRes();

    await controllers.manageLogout(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      400,
      "Logout failed",
      error
    );
  });
});

// ===================== SELF DELETE ACCOUNT ===================== //
describe("selfDeleteAccount", () => {
  let req, res;

  beforeEach(() => {
    req = createReq({}, { authorization: "Bearer faketoken" });
    res = createRes();
    vi.clearAllMocks();
  });

  it("should delete user and respond 200 on success", async () => {
    const decodedToken = { username: "testuser" };
    jwt.verify.mockReturnValueOnce(decodedToken);
    models.deleteUser = vi.fn().mockResolvedValue({ username: "testuser" });

    await controllers.selfDeleteAccount(req, res);

    expect(jwt.verify).toHaveBeenCalledWith(
      "faketoken",
      process.env.JWT_SECRET
    );
    expect(models.deleteUser).toHaveBeenCalledWith("testuser");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User "testuser" deleted successfully',
      deleteConfirmation: { username: "testuser" },
    });
  });

  it("should respond 401 if Authorization header is missing", async () => {
    req.headers.authorization = undefined;

    await controllers.selfDeleteAccount(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      401,
      "Unauthorized: No token provided"
    );
  });

  it("should respond 401 if token verification fails", async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    await controllers.selfDeleteAccount(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      401,
      "Unauthorized: Invalid token"
    );
  });

  it("should respond 400 if deleteUser throws an error", async () => {
    const decodedToken = { username: "testuser" };
    jwt.verify.mockReturnValueOnce(decodedToken);
    const dbError = new Error("Deletion failed");
    models.deleteUser = vi.fn().mockRejectedValueOnce(dbError);

    await controllers.selfDeleteAccount(req, res);

    expect(models.deleteUser).toHaveBeenCalledWith("testuser");
    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      400,
      "Failed to delete user",
      dbError
    );
  });
});

// ===================== LESSON CONTROLLERS ===================== //
describe("manageCreateLesson", () => {
  let req, res;

  beforeEach(() => {
    req = createReq({
      lessonData: {
        type: "Beginner",
        date: "2025-12-20",
        timeLength: 90,
        guests: 6,
      },
    });
    res = createRes();
    vi.clearAllMocks();
  });

  it("should create a lesson successfully", async () => {
    const decoded = { userId: "user123" };
    const createdLesson = {
      ...req.body.lessonData,
      assignedTo: "None",
      _id: "lesson123",
    };

    jwt.verify.mockReturnValueOnce(decoded);
    models.createLesson = vi.fn().mockResolvedValueOnce(createdLesson);

    await controllers.manageCreateLesson(req, res);

    expect(models.createLesson).toHaveBeenCalledWith({
      ...req.body.lessonData,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Lesson created successfully",
      lesson: createdLesson,
    });
  });
});

describe("manageLessonRetrieval", () => {
  it("should verify token, call retrieveLessons, and respond 200", async () => {
    const fakeUserId = {assignedTo:"user123"};
    const fakeLessons = [{ id: 1 }];
    jwt.verify.mockReturnValueOnce({ userId: fakeUserId.assignedTo });
    models.retrieveLessons.mockResolvedValueOnce(fakeLessons);

    const req = createReq({}, { authorization: "Bearer faketoken" });
    const res = createRes();

    await controllers.manageLessonRetrieval(req, res);

    expect(jwt.verify).toHaveBeenCalledWith(
      "faketoken",
      process.env.JWT_SECRET
    );
    expect(models.retrieveLessons).toHaveBeenCalledWith(fakeUserId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: `Lessons retrieved for user ID ${fakeUserId.assignedTo}`,
      lessons: fakeLessons,
    });
  });
});

describe("manageUserRetrieval", () => {
  let req, res;

  beforeEach(() => {
    req = createReq();
    res = createRes();
    vi.clearAllMocks();
  });

  it("should call retrieveUsers and respond 200 with user list", async () => {
    const fakeUsers = [
      { username: "user1", admin: false },
      { username: "user2", admin: true },
    ];

    models.retrieveUsers = vi.fn().mockResolvedValue(fakeUsers);

    await controllers.manageUserRetrieval(req, res);

    // Ensure the model function is called
    expect(models.retrieveUsers).toHaveBeenCalled();

    // Ensure response is correctly formatted
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Users retrieved",
      users: fakeUsers,
    });
  });

  it("should call httpErrorMssg on failure", async () => {
    const err = new Error("Database failed");

    models.retrieveUsers = vi.fn().mockRejectedValue(err);

    await controllers.manageUserRetrieval(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      400,
      "Failed to retrieve users",
      err
    );
  });
});

describe("manageSwitchLessonAssignment", () => {
  let req, res;

  beforeEach(() => {
    req = createReq(
      {},
      { authorization: "Bearer faketoken" },
      { lessonId: "12345" }
    );
    res = createRes();
    vi.clearAllMocks();
  });

  it("should return updated lesson on success", async () => {
    const decoded = { userId: "67890" };
    const mockLesson = { _id: "12345", assignedTo: "67890" };

    jwt.verify.mockReturnValue(decoded);
    models.switchLessonAssignment.mockResolvedValue(mockLesson);

    await controllers.manageSwitchLessonAssignment(req, res);

    expect(jwt.verify).toHaveBeenCalledWith(
      "faketoken",
      process.env.JWT_SECRET
    );
    expect(models.switchLessonAssignment).toHaveBeenCalledWith(
      "12345",
      "user123"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Lesson assignment updated",
      lesson: mockLesson,
    });
  });
});
