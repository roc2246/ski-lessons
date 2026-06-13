import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock external dependencies before any imports
vi.mock("../../email/index.js", () => ({
  errorEmail: vi.fn(),
}));

vi.mock("mongoose", async (importOriginal) => {
  const actual = await importOriginal();
  const connect = vi.fn();
  return {
    ...actual,
    connect,
    default: {
      ...actual.default,
      connect,
      connection: { ...actual.default.connection, on: vi.fn() },
    },
  };
});

import mongoose from "mongoose";
import { errorEmail } from "../../email/index.js";

const originalURI = process.env.URI;
let models;

beforeEach(async () => {
  process.env.URI = "mongodb://localhost:27017/test";
  vi.clearAllMocks();
  // Reset module registry to clear internal 'isConnected' state in db.js
  vi.resetModules();
  models = await import("../index.js");
});

afterEach(() => {
  process.env.URI = originalURI;
});

describe("dbConnect", () => {
  it("should call mongoose.connect with correct args", async () => {
    mongoose.connect.mockResolvedValueOnce("mocked");

    await models.dbConnect();

    expect(mongoose.connect).toHaveBeenCalledOnce();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.URI, {
      dbName: "ski-lessons",
    });
  });

  it("should throw error and email if connection fails", async () => {
    const error = new Error("DB failed");
    mongoose.connect.mockRejectedValueOnce(error);

    // We expect the function to reject because it re-throws after emailing
    await expect(models.dbConnect()).rejects.toThrow("DB failed");

    expect(errorEmail).toHaveBeenCalledWith(
      "Connection Failed",
      expect.stringContaining("DB failed")
    );
  });
});
