import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../email/index.js", () => ({
  errorEmail: vi.fn(),
}));

import * as services from "../index.js";
import jwt from "jsonwebtoken";
import { errorEmail } from "../../email/index.js";
import * as utilities from "../../utilities/index.js";

beforeEach(() => {
  process.env.JWT_SECRET = "test-secret";
});

const blacklistedTokenModel: any = {
  updateOne: vi.fn(() => Promise.resolve()),
  exists: vi.fn(() => Promise.resolve(false)),
};

let instance: any;
const constructorSpy: any = vi.fn(function (this: any, data: any) {
  Object.assign(this, data);
  this.save = vi.fn(() => Promise.resolve());
  instance = this;
});

constructorSpy.findOne = vi.fn((param: any) => {
  if (param.username === "exists") {
    return {
      username: "exists",
      lean: () => Promise.resolve({ username: "exists" }),
    };
  }

  if (param.username === "existusername") {
    return {
      username: "existusername",
      password: "hashed_password",
      _id: "user123",
      admin: true,
      lean: () => Promise.resolve({ username: "existusername", password: "hashed_password", _id: "user123", admin: true }),
    };
  }

  return {
    lean: () => Promise.resolve(null),
  };
});

constructorSpy.find = vi.fn((param: any) => {
  if (param.username === "existusername") {
    return Promise.resolve([{ username: "existusername", password: "hashed_password", _id: "user123", admin: true }]);
  }
  return Promise.resolve([]);
});

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(() => Promise.resolve("hashed_password")),
    compare: vi.fn((provided: string, actual: string) => Promise.resolve(provided === "password" && actual === "hashed_password")),
  },
  hash: vi.fn(() => Promise.resolve("hashed_password")),
  compare: vi.fn((provided: string, actual: string) => Promise.resolve(provided === "password" && actual === "hashed_password")),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "mocked.token"),
    decode: vi.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600 })),
  },
  sign: vi.fn(() => "mocked.token"),
}));

vi.mock("../../utilities/index.js", async () => {
  const actual = await vi.importActual<typeof import("../../utilities/index.js")>("../../utilities/index.js");
  return {
    ...actual,
    getModel: vi.fn((schema: unknown, modelName: string) => {
      if (modelName === "BlacklistedToken") return blacklistedTokenModel;
      return constructorSpy;
    }),
  };
});

describe("newUser", () => {
  it("should register new user with admin flag", async () => {
    await services.newUser("adminUser", "password", true);
    expect(instance).toMatchObject({ username: "adminUser", password: "hashed_password", admin: true });
    expect(instance.save).toHaveBeenCalled();
  });

  it("should throw error if user exists", async () => {
    await expect(services.newUser("exists", "password", false)).rejects.toThrow("User already exists");
    expect(errorEmail).toHaveBeenCalled();
  });
});

describe("loginUser", () => {
  it("should return token and include admin", async () => {
    const token = await services.loginUser("existusername", "password");
    expect(token).toBe("mocked.token");
    expect(jwt.sign).toHaveBeenCalled();
  });

  it("should throw if credentials are wrong", async () => {
    await expect(services.loginUser("existusername", "wrongpass")).rejects.toThrow("User or password doesn't match");
  });
});

describe("deleteUser", () => {
  beforeEach(() => {
    constructorSpy.findOneAndDelete = vi.fn(async (query: any) => {
      if (query.username === "existentUser") return { username: "existentUser", _id: "user123" };
      return null;
    });
  });

  it("deletes user and returns doc", async () => {
    const deleted = await services.deleteUser("existentUser");
    expect(deleted).toEqual({ username: "existentUser", _id: "user123" });
  });

  it("throws if user not found", async () => {
    await expect(services.deleteUser("nonexistent")).rejects.toThrow("No user found with username: nonexistent");
  });
});

describe("logoutUser", () => {
  it("persists token to blacklist store", async () => {
    await services.logoutUser("fake.token");
    expect(blacklistedTokenModel.updateOne).toHaveBeenCalled();
  });

  it("throws 401-style errors when token data is invalid", async () => {
    (jwt.decode as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(null);

    await expect(services.logoutUser("bad.token")).rejects.toThrow("Invalid token: missing expiration");
  });
});
