import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../email/index.js", () => ({
  errorEmail: vi.fn(),
}));

vi.mock("mongoose", async (importOriginal) => {
  const actual = await importOriginal<typeof import("mongoose")>();
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
let services: typeof import("../index.js");

beforeEach(async () => {
  process.env.URI = "mongodb://localhost:27017/test";
  vi.clearAllMocks();
  vi.resetModules();
  services = await import("../index.js");
});

afterEach(() => {
  if (originalURI === undefined) {
    delete process.env.URI;
  } else {
    process.env.URI = originalURI;
  }
});

describe("dbConnect", () => {
  it("should call mongoose.connect with correct args", async () => {
    (mongoose.connect as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce("mocked");

    await services.dbConnect();

    expect(mongoose.connect).toHaveBeenCalledOnce();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.URI, {
      dbName: "ski-lessons",
    });
  });

  it("should throw error and email if connection fails", async () => {
    const error = new Error("DB failed");
    (mongoose.connect as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

    await expect(services.dbConnect()).rejects.toThrow("DB failed");

    expect(errorEmail).toHaveBeenCalledWith("Connection Failed", expect.stringContaining("DB failed"));
  });
});
