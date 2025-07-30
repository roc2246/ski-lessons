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
      { username: "existusername", password: "hashed_password", _id: "user123" },
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
  return {
    ...mockMethods,
    default: mockMethods,
  };
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
    decode: vi.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600 })),
  },
  sign: vi.fn(() => "mocked.token"),
  decode: vi.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600 })),
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

describe("dbConnect", () => {
  it("should call mongoose.connect with correct args", async () => {
    await models.dbConnect();
    expect(mongoose.connect).toHaveBeenCalledOnce();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.URI, {
      dbName: "ski-lessons",
    });
  });

  it("should throw error and email if connection fails", async () => {
    process.env.URI = "fail";

    await expect(models.dbConnect()).rejects.toThrow("DB failed");
    expect(errorEmail).toHaveBeenCalled();
  });
});

describe("newUser", () => {
  it("should register new user", async () => {
    await models.newUser("username", "password");

    expect(constructorSpy.find).toHaveBeenCalledWith({ username: "username" });
    expect(instance).toBeDefined();
    expect(instance).toMatchObject({
      username: "username",
      password: "hashed_password",
    });
    expect(instance.save).toHaveBeenCalled();
  });

  it("should throw error if args are missing", async () => {
    await expect(models.newUser(null, "")).rejects.toThrow("Username required");
    await expect(models.newUser(" ", null)).rejects.toThrow("Password required");
    expect(errorEmail).toHaveBeenCalled();
  });

  it("should throw error if user already exists", async () => {
    await expect(models.newUser("exists", "password")).rejects.toThrow(
      "User already exists"
    );
    expect(errorEmail).toHaveBeenCalled();
  });
});

describe("loginUser", () => {
  it("should return a user token", async () => {
    const token = await models.loginUser("existusername", "password");

    expect(constructorSpy.find).toHaveBeenCalledWith({
      username: "existusername",
    });
    expect(jwt.sign).toHaveBeenCalled();
    expect(token).toBe("mocked.token");
  });

  it("should throw error if args are missing", async () => {
    await expect(models.loginUser(null, "")).rejects.toThrow("Username required");
    await expect(models.loginUser(" ", null)).rejects.toThrow("Password required");
  });

  it("should throw error if credentials are wrong", async () => {
    await expect(
      models.loginUser("existusername", "wrongpass")
    ).rejects.toThrow("User or password doesn't match");
  });
});

describe("logoutUser", () => {
  it("adds token to blacklist", async () => {
    const mockBlacklist = {
      add: vi.fn(),
      has: vi.fn(),
      stop: vi.fn(),
    };

    await models.logoutUser(mockBlacklist, "fake.token");

    expect(mockBlacklist.add).toHaveBeenCalledWith("fake.token");
  });
});

describe("retrieveLessons", () => {
  it("should retrieve lessons", async () => {
    const results = await models.retrieveLessons("2");

    expect(constructorSpy.find).toHaveBeenCalledWith({ assignedTo: "2" });
    expect(results).toEqual([{ lesson: "lesson" }]);
  });

  it("should throw an error if ID is not a string", async () => {
    await expect(models.retrieveLessons(88)).rejects.toThrow("ID must be a string");
    expect(errorEmail).toHaveBeenCalled();
  });
});

describe("createTokenBlacklist", () => {
  it("should create a blacklist instance", () => {
    const blacklist = models.createTokenBlacklist();
    expect(blacklist).toBeInstanceOf(utilities.TokenBlacklist);
  });
});

describe("removeLesson", () => {
  // Attach a mock for findByIdAndDelete on the constructor
  beforeEach(() => {
    constructorSpy.findByIdAndDelete = vi.fn((id) => {
      if (id === "validLessonId") {
        return Promise.resolve({ _id: id, title: "Test Lesson" });
      }
      return Promise.resolve(null); // Simulate "not found"
    });
  });

  it("should delete a lesson by ID", async () => {
    const result = await models.removeLesson("validLessonId");

    expect(utilities.getModel).toHaveBeenCalled(); // Ensure model retrieval
    expect(constructorSpy.findByIdAndDelete).toHaveBeenCalledWith("validLessonId");
    expect(result).toEqual({
      success: true,
      message: "Lesson successfully removed",
      lesson: { _id: "validLessonId", title: "Test Lesson" },
    });
  });

  it("should throw an error if ID is not a string", async () => {
    await expect(models.removeLesson(123)).rejects.toThrow("Lesson ID must be a string");
    expect(errorEmail).toHaveBeenCalledWith(
      "Failed to remove lesson",
      expect.stringContaining("Lesson ID must be a string")
    );
  });

  it("should throw an error if lesson is not found", async () => {
    await expect(models.removeLesson("nonexistent")).rejects.toThrow(
      "Lesson not found or already deleted"
    );
    expect(errorEmail).toHaveBeenCalledWith(
      "Failed to remove lesson",
      expect.stringContaining("Lesson not found")
    );
  });

  it("should send an error email if something fails", async () => {
    // Cause findByIdAndDelete to throw
    constructorSpy.findByIdAndDelete.mockRejectedValueOnce(new Error("DB error"));

    await expect(models.removeLesson("validLessonId")).rejects.toThrow("DB error");
    expect(errorEmail).toHaveBeenCalledWith(
      "Failed to remove lesson",
      expect.stringContaining("DB error")
    );
  });
});

describe("createLesson", () => {
  beforeEach(() => {
    // Ensure constructorSpy returns a fresh object with .save mocked before each test
    instance = {
      save: vi.fn(() => Promise.resolve()),
    };
    constructorSpy.mockImplementation((data) => {
      Object.assign(instance, data);
      return instance;
    });
  });

  it("should create a new lesson", async () => {
    const lessonInput = {
      type: "private",
      date: "2025-12-01",
      timeLength: "2 hours",
      guests: 2,
      assignedTo: "64bfe5a3c7d2f4001a9c1bfa", // realistic ObjectId-like string
    };

    const result = await models.createLesson(lessonInput);

    expect(utilities.getModel).toHaveBeenCalled();
    expect(instance).toMatchObject(lessonInput);
    expect(instance.save).toHaveBeenCalled();
    expect(result).toBe(instance);
  });

  it("should throw an error if any field is missing", async () => {
    await expect(
      models.createLesson({
        type: "group",
        date: "", // Invalid
        timeLength: "1 hour",
        guests: 4,
        assignedTo: "abc123def456ghi789jkl", // valid-looking string
      })
    ).rejects.toThrow("Date required");

    expect(errorEmail).toHaveBeenCalledWith(
      "Failed to create lesson",
      expect.stringContaining("Date required")
    );
  });

  it("should throw and email error if save fails", async () => {
    // Override the instance's save to reject
    instance.save = vi.fn(() => Promise.reject(new Error("Save failed")));

    await expect(
      models.createLesson({
        type: "private",
        date: "2025-12-01",
        timeLength: "2 hours",
        guests: 2,
        assignedTo: "a1b2c3d4e5f6g7h8i9j0klmn",
      })
    ).rejects.toThrow("Save failed");

    expect(errorEmail).toHaveBeenCalledWith(
      "Failed to create lesson",
      expect.stringContaining("Save failed")
    );
  });
});

describe("switchLessonAssignment", () => {
  // Mock findByIdAndUpdate on the constructorSpy
  beforeEach(() => {
    constructorSpy.findByIdAndUpdate = vi.fn((id, update, options) => {
      if (typeof id !== "string" || typeof update.assignedTo !== "string") {
        return Promise.reject(new Error("Invalid input"));
      }
      if (id === "validLessonId") {
        // Return updated lesson mock
        return Promise.resolve({
          _id: id,
          assignedTo: update.assignedTo,
          type: "private",
          date: "2025-12-01",
          timeLength: "2 hours",
          guests: 2,
        });
      }
      // Simulate lesson not found
      return Promise.resolve(null);
    });
  });

  it("should update the assignedTo field and return the updated lesson", async () => {
    const updatedUserId = "newUser123";
    const updatedLesson = await models.switchLessonAssignment("validLessonId", updatedUserId);

    expect(utilities.getModel).toHaveBeenCalled();
    expect(constructorSpy.findByIdAndUpdate).toHaveBeenCalledWith(
      "validLessonId",
      { assignedTo: updatedUserId },
      { new: true }
    );
    expect(updatedLesson).toBeDefined();
    expect(updatedLesson.assignedTo).toBe(updatedUserId);
  });

  it("should throw if id is not a string", async () => {
    await expect(models.switchLessonAssignment(123, "newUser")).rejects.toThrow("Lesson ID must be a string");
    expect(errorEmail).toHaveBeenCalledWith(
      "Failed to switch lesson assignment",
      expect.stringContaining("Lesson ID must be a string")
    );
  });

  it("should throw if newUserId is not a string", async () => {
    await expect(models.switchLessonAssignment("validLessonId", 456)).rejects.toThrow("New User ID must be a string");
    expect(errorEmail).toHaveBeenCalledWith(
      "Failed to switch lesson assignment",
      expect.stringContaining("New User ID must be a string")
    );
  });

  it("should throw if lesson not found", async () => {
    await expect(models.switchLessonAssignment("nonexistentId", "newUser123")).rejects.toThrow("Lesson not found");
    expect(errorEmail).toHaveBeenCalledWith(
      "Failed to switch lesson assignment",
      expect.stringContaining("Lesson not found")
    );
  });

  it("should send error email if database update throws", async () => {
    constructorSpy.findByIdAndUpdate.mockRejectedValueOnce(new Error("DB error"));

    await expect(models.switchLessonAssignment("validLessonId", "newUser123")).rejects.toThrow("DB error");
    expect(errorEmail).toHaveBeenCalledWith(
      "Failed to switch lesson assignment",
      expect.stringContaining("DB error")
    );
  });
});

