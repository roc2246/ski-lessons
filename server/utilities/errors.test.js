import { describe, it, expect, vi } from "vitest";
import { sendError } from "./errors.js";

describe("sendError", () => {
  it("sends a JSON error response", () => {
    const jsonMock = vi.fn();
    const res = { status: vi.fn(() => ({ json: jsonMock })) };

    const error = new Error("Something went wrong");
    sendError(res, 500, "Custom error message", error);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Custom error message",
      error: "Something went wrong",
    });
  });

  it("defaults to unknown error if error.message missing", () => {
    const jsonMock = vi.fn();
    const res = { status: vi.fn(() => ({ json: jsonMock })) };

    sendError(res, 400, "Bad request", {});
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Bad request",
      error: "An unknown error occurred",
    });
  });
});
