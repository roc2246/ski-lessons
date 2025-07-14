import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import mongoose from "mongoose";
import { errorEmail } from "../email";
import * as models from ".";
import jwt from "jsonwebtoken";

// Spy constructor for mocked model
const constructorSpy = vi.fn(function (data) {
  Object.assign(this, data);
  this.save = vi.fn(() => Promise.resolve());
});
constructorSpy.find = vi.fn((param) => {
  // if (param.assignedTo) {
  //   if (typeof param.assignedTo === Number) {
  //     return [{ lesson: "lesson" }];
  //   } else {
  //     throw Error;
  //   }
  // }
  if (param.username === "exists") {
    return Promise.resolve([param]);
  } else if (param.username === "existusername") {
    return Promise.resolve([
      { username: "existusername", password: "hashed_password" },
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
  const connectMock = vi.fn((uri, db) => {
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

const originalURI = process.env.URI;

afterEach(() => {
  process.env.URI = originalURI;
  vi.clearAllMocks();
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

    expect(mongoose.Schema).toHaveBeenCalled();
    expect(mongoose.model).toHaveBeenCalled();
    expect(constructorSpy).toHaveBeenCalledWith({
      username: "username",
      password: "hashed_password",
    });
    expect(constructorSpy.find).toHaveBeenCalledWith({ username: "username" });

    const instance = constructorSpy.mock.results[0].value;
    expect(instance.save).toHaveBeenCalled();
  });

  it("should throw error if args are missing", async () => {
    await expect(models.newUser(null, "")).rejects.toThrow("Username required");
    await expect(models.newUser(" ", null)).rejects.toThrow(
      "Password required"
    );
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
    const result = await models.loginUser("existusername", "password");

    expect(mongoose.Schema).toHaveBeenCalled();
    expect(mongoose.model).toHaveBeenCalled();
    expect(constructorSpy.find).toHaveBeenCalledWith({
      username: "existusername",
    });
    expect(jwt.sign).toHaveBeenCalled();
    expect(result).toBe("mocked.token");
  });

  it("should throw error if args are missing", async () => {
    await expect(models.loginUser(null, "")).rejects.toThrow(
      "Username required"
    );
    await expect(models.loginUser(" ", null)).rejects.toThrow(
      "Password required"
    );
    expect(errorEmail).toHaveBeenCalled();
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
    const results = await models.retrieveLessons(2);
    expect(mongoose.Schema).toHaveBeenCalled();
    expect(mongoose.model).toHaveBeenCalled();
    expect(constructorSpy.find).toHaveBeenCalledWith({ assignedTo: 2 });
  });
  it("should throw an error", async () => {
    await models.retrieveLessons("test");
    expect(errorEmail).toHaveBeenCalled();
  });
});
