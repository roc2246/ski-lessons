import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticate, requireAdmin } from "../auth.js";
import * as utilities from "../../utilities/index.js";
import * as models from "../../models/index.js";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(() => ({ userId: "123", admin: true })),
  },
}));

vi.mock("../../utilities/index.js", async () => {
  const actual = await vi.importActual("../../utilities/index.js");
  return {
    ...actual,
    sendError: vi.fn((res, status, message) => {
      res.statusCode = status;
      res.body = message;
      return res;
    }),
  };
});

vi.mock("../../models/index.js", () => ({
  isTokenBlacklisted: vi.fn(() => Promise.resolve(false)),
}));

describe("authenticate", () => {
  it("rejects requests with no bearer token", async () => {
    const req = { headers: {} };
    const res = { statusCode: 200, body: "" };
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(utilities.sendError).toHaveBeenCalledWith(res, 401, "Unauthorized: No token provided");
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the decoded user and token when authentication succeeds", async () => {
    const req = { headers: { authorization: "Bearer valid-token" } };
    const res = { statusCode: 200, body: "" };
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(req.user).toEqual({ userId: "123", admin: true });
    expect(req.token).toBe("valid-token");
    expect(next).toHaveBeenCalled();
  });
});

describe("requireAdmin", () => {
  it("blocks non-admin users", () => {
    const req = { user: { admin: false } };
    const res = { statusCode: 200, body: "" };
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(utilities.sendError).toHaveBeenCalledWith(res, 403, "Forbidden: Admin access required");
    expect(next).not.toHaveBeenCalled();
  });

  it("allows admin users through", () => {
    const req = { user: { admin: true } };
    const res = { statusCode: 200, body: "" };
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
