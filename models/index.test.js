import { describe, it, expect, vi, beforeAll } from "vitest";
import mongoose from "mongoose";
import { errorEmail } from "../email";

import * as models from ".";


vi.mock("mongoose", () => {
  const connectMock = vi.fn((uri, db) => {
    if (uri === "fail") {
      throw new Error("DB failed");
    }
    return Promise.resolve("mocked connection");
  });

  return {
    default: { connect: connectMock },
    connect: connectMock,
  };
});

vi.mock("../email/index.js");


beforeAll(async () => {
  process.env.URI = "mock://localhost";

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
    expect(errorEmail).toHaveBeenCalledOnce();
  });
});
