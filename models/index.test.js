import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import * as models from ".";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { errorEmail } from "../email";
import * as utilities from "../utilities";

// Capture instance of model
let instance;

// Mock constructor for models
const constructorSpy = vi.fn(function (data) {
  Object.assign(this, data);
  this.save = vi.fn(() => Promise.resolve());
  instance = this;
});

// Attach .find to constructor
constructorSpy.find = vi.fn((param) => {
  if (param.assignedTo) {
    if (typeof param.assignedTo === "string") {
      return Promise.resolve([{ lesson: "lesson" }]);
    } else {
      throw new Error("ID must be a string");
    }
  }

  if (param.username === "exists") {
    return Promise.resolve([param]);
  } else if (param.username === "existusername") {
    return Promise.resolve([
      { username: "existusername", password: "hashed_password", _id: "user123", admin: true },
    ]);
  } else {
    return Promise.resolve([]);
  }
});

// Mock bcrypt
vi.mock("bcrypt", () => {
  const mockMethods = {
    hash: vi.fn(() => Promise.resolve("hashed_password")),
    compare: vi.fn((provided, actual) =>
      Promise.resolve(provided === "password" && actual === "hashed_password")
    ),
  };
  return { ...mockMethods, default: mockMethods };
});

// Mock mongoose
vi.mock("mongoose", () => {
  const connectMock = vi.fn((uri) => {
    if (uri === "fail") throw new Error("DB failed");
  });

  return {
    connect: connectMock,
    Schema: vi.fn(),
    model: vi.fn(() => constructorSpy),
    disconnect: vi.fn(),
    default: {
      connect: connectMock,
      Schema: vi.fn(),
      model: vi.fn(() => constructorSpy),
      disconnect: vi.fn(),
    },
  };
});

// Mock jsonwebtoken
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "mocked.token"),
    decode: vi.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600, admin: true })),
  },
  sign: vi.fn(() => "mocked.token"),
  decode: vi.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600, admin: true })),
}));

// Mock email
vi.mock("../email/index.js", () => ({
  errorEmail: vi.fn(),
}));

// Mock getModel from utilities
vi.mock("../utilities/index.js", async () => {
  const actual = await vi.importActual("../utilities/index.js");
  return {
    ...actual,
    getModel: vi.fn(() => constructorSpy),
    schemas: actual.schemas,
    argValidation: actual.argValidation,
    TokenBlacklist: actual.TokenBlacklist,
  };
});

// Environment setup
const originalURI = process.env.URI;
const originalSecret = process.env.JWT_SECRET;

beforeEach(() => {
  process.env.URI = "mongodb://localhost:27017/test";
  process.env.JWT_SECRET = "testsecret";
  instance = undefined;
  vi.clearAllMocks();
});

afterEach(() => {
  process.env.URI = originalURI;
  process.env.JWT_SECRET = originalSecret;
});

// ===== DB CONNECTION =====
describe("dbConnect", () => {
  it("should call mongoose.connect with correct args", async () => {
    await models.dbConnect();
    expect(mongoose.connect).toHaveBeenCalledOnce();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.URI, { dbName: "ski-lessons" });
  });

  it("should throw error and email if connection fails", async () => {
    process.env.URI = "fail";
    await expect(models.dbConnect()).rejects.toThrow("DB failed");
    expect(errorEmail).toHaveBeenCalled();
  });
});

// ===== AUTH =====
describe("newUser", () => {
  it("should register new user with admin flag", async () => {
    await models.newUser("adminUser", "password", true);
    expect(instance).toMatchObject({
      username: "adminUser",
      password: "hashed_password",
      admin: true,
    });
    expect(instance.save).toHaveBeenCalled();
  });

  it("should throw error if user exists", async () => {
    await expect(models.newUser("exists", "password", false)).rejects.toThrow("User already exists");
    expect(errorEmail).toHaveBeenCalled();
  });

  it("should throw error if args are missing", async () => {
    await expect(models.newUser(null, "", false)).rejects.toThrow("Username required");
    await expect(models.newUser(" ", null, false)).rejects.toThrow("Password required");
    await expect(models.newUser(" ", "password", null)).rejects.toThrow("Admin required");
    expect(errorEmail).toHaveBeenCalled();
  });
});

describe("loginUser", () => {
  it("should return token and include admin from payload", async () => {
    const token = await models.loginUser("existusername", "password");
    expect(token).toBe("mocked.token");
    expect(jwt.sign).toHaveBeenCalled();
  });

  it("should throw if credentials are wrong", async () => {
    await expect(models.loginUser("existusername", "wrongpass")).rejects.toThrow("User or password doesn't match");
  });
});

// ===== USER CRUD =====
describe("deleteUser", () => {
  beforeEach(() => {
    constructorSpy.findOneAndDelete = vi.fn(async (query) => {
      if (query.username === "existentUser") return { username: "existentUser", _id: "user123" };
      return null;
    });
  });

  it("deletes user and returns doc", async () => {
    const deleted = await models.deleteUser("existentUser");
    expect(deleted).toEqual({ username: "existentUser", _id: "user123" });
  });

  it("throws if user not found", async () => {
    await expect(models.deleteUser("nonexistent")).rejects.toThrow("No user found with username: nonexistent");
  });
});

// ===== LOGOUT =====
describe("logoutUser", () => {
  it("adds token to blacklist", async () => {
    const blacklist = { add: vi.fn() };
    await models.logoutUser(blacklist, "fake.token");
    expect(blacklist.add).toHaveBeenCalledWith("fake.token");
  });
});

// ===== LESSON CRUD =====
describe("createLesson", () => {
  it("creates a lesson", async () => {
    const lessonInput = { type: "private", date: "2025-12-01", timeLength: "2 hours", guests: 2, assignedTo: "user123" };
    const result = await models.createLesson(lessonInput);
    expect(result).toBe(instance);
    expect(instance.save).toHaveBeenCalled();
  });

  it("throws if required field missing", async () => {
    await expect(models.createLesson({ type: "group", date: "", timeLength: "1 hour", guests: 4, assignedTo: "abc" }))
      .rejects.toThrow("Date required");
    expect(errorEmail).toHaveBeenCalled();
  });
});

describe("retrieveLessons", () => {
  it("returns lessons for valid ID", async () => {
    const results = await models.retrieveLessons("2");
    expect(results).toEqual([{ lesson: "lesson" }]);
  });

  it("throws if ID not string", async () => {
    await expect(models.retrieveLessons(88)).rejects.toThrow("ID must be a string");
    expect(errorEmail).toHaveBeenCalled();
  });
});

describe("switchLessonAssignment", () => {
  beforeEach(() => {
    constructorSpy.findByIdAndUpdate = vi.fn((id, update) => {
      if (id === "validLessonId") return Promise.resolve({ _id: id, assignedTo: update.assignedTo });
      return Promise.resolve(null);
    });
  });

  it("switches assigned instructor", async () => {
    const lesson = await models.switchLessonAssignment("validLessonId", "newUser123");
    expect(lesson.assignedTo).toBe("newUser123");
  });

  it("throws if lesson not found", async () => {
    await expect(models.switchLessonAssignment("badId", "newUser")).rejects.toThrow("Lesson not found");
  });
});

describe("removeLesson", () => {
  beforeEach(() => {
    constructorSpy.findByIdAndDelete = vi.fn((id) => {
      if (id === "validLessonId") return Promise.resolve({ _id: id, title: "Test Lesson" });
      return Promise.resolve(null);
    });
  });

  it("deletes lesson successfully", async () => {
    const result = await models.removeLesson("validLessonId");
    expect(result.success).toBe(true);
    expect(result.lesson._id).toBe("validLessonId");
  });

  it("throws if lesson not found", async () => {
    await expect(models.removeLesson("notFound")).rejects.toThrow("Lesson not found or already deleted");
  });
});

describe("createTokenBlacklist", () => {
  it("returns instance of TokenBlacklist", () => {
    const blacklist = models.createTokenBlacklist();
    expect(blacklist).toBeInstanceOf(utilities.TokenBlacklist);
  });
});
