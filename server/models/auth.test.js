vi.mock("../email/index.js", () => ({
  errorEmail: vi.fn(),  // spy
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as models from "./index.js";
import jwt from "jsonwebtoken";
import { errorEmail } from "../email";
import * as utilities from "../utilities";

// Mock constructor for User model
let instance;
const constructorSpy = vi.fn(function (data) {
  Object.assign(this, data);
  this.save = vi.fn(() => Promise.resolve());
  instance = this;
});
constructorSpy.find = vi.fn((param) => {
  if (param.username === "exists") return Promise.resolve([param]);
  if (param.username === "existusername")
    return Promise.resolve([
      { username: "existusername", password: "hashed_password", _id: "user123", admin: true },
    ]);
  return Promise.resolve([]);
});

// Mock dependencies
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(() => Promise.resolve("hashed_password")),
    compare: vi.fn((provided, actual) =>
      Promise.resolve(provided === "password" && actual === "hashed_password")
    ),
  },
  hash: vi.fn(() => Promise.resolve("hashed_password")),
  compare: vi.fn((provided, actual) =>
    Promise.resolve(provided === "password" && actual === "hashed_password")
  ),
}));

vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn(() => "mocked.token") },
  sign: vi.fn(() => "mocked.token"),
}));
vi.mock("../utilities/index.js", async () => {
  const actual = await vi.importActual("../utilities/index.js");
  return {
    ...actual,
    getModel: vi.fn(() => constructorSpy),
    UserSchema: actual.UserSchema,
    argValidation: actual.argValidation,
    TokenBlacklist: actual.TokenBlacklist,
  };
});

describe("newUser", () => {
  it("should register new user with admin flag", async () => {
    await models.newUser("adminUser", "password", true);
    expect(instance).toMatchObject({ username: "adminUser", password: "hashed_password", admin: true });
    expect(instance.save).toHaveBeenCalled();
  });

  it("should throw error if user exists", async () => {
    await expect(models.newUser("exists", "password", false)).rejects.toThrow("User already exists");
    expect(errorEmail).toHaveBeenCalled();
  });

  it("should throw if args missing", async () => {
    await expect(models.newUser(null, "", false)).rejects.toThrow();
    await expect(models.newUser(" ", null, false)).rejects.toThrow();
    await expect(models.newUser(" ", "password", null)).rejects.toThrow();
  });
});

describe("loginUser", () => {
  it("should return token and include admin", async () => {
    const token = await models.loginUser("existusername", "password");
    expect(token).toBe("mocked.token");
    expect(jwt.sign).toHaveBeenCalled();
  });

  it("should throw if credentials are wrong", async () => {
    await expect(models.loginUser("existusername", "wrongpass")).rejects.toThrow(
      "User or password doesn't match"
    );
  });
});

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
    await expect(models.deleteUser("nonexistent")).rejects.toThrow(
      "No user found with username: nonexistent"
    );
  });
});

describe("logoutUser", () => {
  it("adds token to blacklist", async () => {
    const blacklist = { add: vi.fn() };
    await models.logoutUser(blacklist, "fake.token");
    expect(blacklist.add).toHaveBeenCalledWith("fake.token");
  });
});
