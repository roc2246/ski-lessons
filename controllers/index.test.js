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

// Mock request helper (minimal)
const createReq = (body = {}, headers = {}) => ({
  body,
  headers,
});

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

// Mock models module functions as needed
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
  };
});

// Mock utilities
vi.mock("../utilities/index.js", async () => {
  const actual = await vi.importActual("../utilities/index.js");
  return {
    ...actual,
    httpErrorMssg: vi.fn(),
  };
});

describe("Controller Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("manageNewUser", () => {
    it("should respond with 201 and message on success", async () => {
      models.newUser.mockResolvedValueOnce();

      const req = createReq({ username: "user", password: "pass" });
      const res = createRes();

      await controllers.manageNewUser(req, res);

      expect(models.newUser).toHaveBeenCalledWith("user", "pass");
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
      const addMock = vi.fn();
      models.createTokenBlacklist.mockReturnValueOnce({ add: addMock });
      const error = new Error("fail");
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

  describe("manageLessonRetrieval", () => {
    it("should verify token, call retrieveLessons, and respond 200", async () => {
      const fakeUserId = "user123";
      const fakeLessons = [{ id: 1 }];

      models.retrieveLessons.mockResolvedValueOnce(fakeLessons);
      jwt.verify.mockReturnValueOnce({ userId: fakeUserId });

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
        message: `Lessons retrieved for user ID ${fakeUserId}`,
        lessons: fakeLessons,
      });
    });

    it("should respond with 401 if no Authorization header", async () => {
      const req = createReq({}, {});
      const res = createRes();

      await controllers.manageLessonRetrieval(req, res);

      expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
        res,
        401,
        "Unauthorized: No token provided"
      );
    });

    it("should respond with 401 if token invalid", async () => {
      jwt.verify.mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const req = createReq({}, { authorization: "Bearer faketoken" });
      const res = createRes();

      await controllers.manageLessonRetrieval(req, res);

      expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
        res,
        401,
        "Unauthorized: Invalid token"
      );
    });

    it("should call httpErrorMssg on other errors", async () => {
      jwt.verify.mockReturnValueOnce({ userId: "user123" });
      const error = new Error("fail");
      models.retrieveLessons.mockRejectedValueOnce(error);

      const req = createReq({}, { authorization: "Bearer faketoken" });
      const res = createRes();

      await controllers.manageLessonRetrieval(req, res);

      expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
        res,
        400,
        "Failed to retrieve lessons",
        error
      );
    });
  });
});

describe("manageSwitchLessonAssignment", () => {
  it("should respond with 200 and updated lesson on success", async () => {
    const updatedLesson = {
      _id: "lesson123",
      type: "private",
      assignedTo: "newUser123",
    };
    models.switchLessonAssignment = vi.fn().mockResolvedValue(updatedLesson);

    const req = createReq(
      { lessonId: "lesson123", newUserId: "newUser123" },
      {}
    );
    const res = createRes();

    await controllers.manageSwitchLessonAssignment(req, res);

    expect(models.switchLessonAssignment).toHaveBeenCalledWith(
      "lesson123",
      "newUser123"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Lesson assignment updated",
      lesson: updatedLesson,
    });
  });

  it("should respond with 400 if lessonId or newUserId missing", async () => {
    const req = createReq({ lessonId: "lesson123" }); // no newUserId
    const res = createRes();

    await controllers.manageSwitchLessonAssignment(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      400,
      "Lesson ID and New User ID are required"
    );
  });

  it("should call httpErrorMssg on failure", async () => {
    const error = new Error("fail");
    models.switchLessonAssignment = vi.fn().mockRejectedValue(error);

    const req = createReq(
      { lessonId: "lesson123", newUserId: "newUser123" },
      {}
    );
    const res = createRes();

    await controllers.manageSwitchLessonAssignment(req, res);

    expect(utilities.httpErrorMssg).toHaveBeenCalledWith(
      res,
      400,
      "Failed to switch lesson assignment",
      error
    );
  });
});
