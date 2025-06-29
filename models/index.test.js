import { describe, it, expect, vi, beforeAll } from "vitest";

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

vi.mock("../email/index.js", () => ({
  errorEmail: vi.fn(),
}));

let models;
let mongooseMock;
let errorEmailMock;

beforeAll(async () => {
  process.env.URI = "mock://localhost";

  mongooseMock = await import("mongoose");
  errorEmailMock = (await import("../email/index.js")).errorEmail;
  models = await import(".");
});

describe("dbConnect", () => {
  it("should call mongoose.connect with correct args", async () => {
    await models.dbConnect();

    expect(mongooseMock.connect).toHaveBeenCalledOnce();
    expect(mongooseMock.connect).toBeCalledWith(process.env.URI, {
      dbName: "ski-lessons",
    });
  });

  it("should throw error", async () => {
    process.env.URI = "fail";

    await expect(models.dbConnect()).rejects.toThrow("DB failed");
    expect(errorEmailMock).toHaveBeenCalledOnce();
  });
});
