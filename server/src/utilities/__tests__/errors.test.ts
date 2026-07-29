import { describe, it, expect, vi } from "vitest";
import { sendError } from "../errors.js";

const createRes = () => {
  const json = vi.fn();
  const res: any = {
    status: vi.fn(() => ({ json })),
  };
  return { res, json };
};

describe("sendError", () => {
  it("sends a JSON error response", () => {
    const { res, json } = createRes();

    const error = new Error("Something went wrong");
    sendError(res, 500, "Custom error message", error);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      message: "Custom error message",
      error: "An internal error occurred",
    });
  });

  it("defaults to unknown error if error.message missing", () => {
    const { res, json } = createRes();

    sendError(res, 400, "Bad request", {} as Error);
    expect(json).toHaveBeenCalledWith({
      message: "Bad request",
      error: "Bad request",
    });
  });
});
