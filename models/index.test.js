import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import mongoose, { disconnect } from "mongoose";
import { errorEmail } from "../email";

import * as models from ".";

vi.mock("mongoose", () => {
  const connectMock = vi.fn((uri, db) => {
    if (uri === "fail") throw new Error("DB failed");
  });

  return {
    default: { connect: connectMock, disconnect: vi.fn() },
    connect: connectMock,
    disconnect: vi.fn()
  };
});

vi.mock("../email/index.js");

const originalURI = process.env.URI
afterAll(async () => {
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

describe("newUser", ()=>{
  it("should throw error if there is no args", async()=>{
    await expect(models.newUser(null,"")).rejects.toThrow("Username required");
    await expect(models.newUser(" ",null)).rejects.toThrow("Password required");
    expect(errorEmail).toHaveBeenCalled();
  })
})
