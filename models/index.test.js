import { describe, it, expect, vi, afterEach } from "vitest";
import mongoose from "mongoose";
import { errorEmail } from "../email";
import * as models from ".";

// Spy constructor
const constructorSpy = vi.fn(function (data) {
  Object.assign(this, data);
  this.save = vi.fn(() => Promise.resolve());
});
constructorSpy.find = vi.fn((param) => {
  if (param.username === "exists") {
   return Promise.resolve([param]);
  } else {
   return Promise.resolve([]);
  }
});

vi.mock("bcrypt", () => {
  return {
    hash: vi.fn(() => Promise.resolve("hashed_password")),
    default: {
      hash: vi.fn(() => Promise.resolve("hashed_password")),
    },
  };
});

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

vi.mock("../email/index.js");

const originalURI = process.env.URI;
afterEach(() => {
  process.env.URI = originalURI;
});

describe("dbConnect", () => {
  it("should call mongoose.connect with correct args", async () => {
    await models.dbConnect();

    expect(mongoose.connect).toHaveBeenCalledOnce();
    expect(mongoose.connect).toBeCalledWith(process.env.URI, {
      dbName: "ski-lessons",
    });
  });

  it("should throw error", async () => {
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

  it("should throw error if there is no args", async () => {
    await expect(models.newUser(null, "")).rejects.toThrow("Username required");
    await expect(models.newUser(" ", null)).rejects.toThrow(
      "Password required"
    );
    expect(errorEmail).toHaveBeenCalled();
  });
  it("should throw error if the username already exists", async () => {
    await expect(models.newUser("exists", "password")).rejects.toThrow(
      "User already exists"
    );
    expect(errorEmail).toHaveBeenCalled();
  });
});
