import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as models from "./index.js";
import mongoose from "mongoose";
import { errorEmail } from "../email";

// Environment setup
const originalURI = process.env.URI;

beforeEach(() => {
  process.env.URI = "mongodb://localhost:27017/test";
  vi.clearAllMocks();
  vi.spyOn(mongoose, "connect").mockImplementation(async () => "mocked");
});

afterEach(() => {
  process.env.URI = originalURI;
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
    const error = new Error("DB failed");
    mongoose.connect.mockRejectedValue(error);

    await expect(models.dbConnect()).rejects.toThrow("DB failed");
    expect(errorEmail).toHaveBeenCalledWith(
      "Connection Failed",
      "Error: DB failed"
    );
  });
});
