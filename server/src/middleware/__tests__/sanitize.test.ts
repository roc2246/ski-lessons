import { describe, it, expect, vi } from "vitest";
import { sanitizeRequest } from "../sanitize.js";

describe("sanitizeRequest", () => {
  it("sanitizes body and request objects without throwing when params and query are getter-backed", () => {
    const params = { lessonId: { $gt: "bad" } };
    const query = { search: { $regex: "x" } };
    const req: any = {
      body: {
        username: { $ne: "x" },
        nested: { value: "ok" },
      },
    };

    Object.defineProperty(req, "params", {
      configurable: true,
      enumerable: true,
      get: () => params,
    });

    Object.defineProperty(req, "query", {
      configurable: true,
      enumerable: true,
      get: () => query,
    });

    const res: any = {};
    const next = vi.fn();

    expect(() => sanitizeRequest(req, res, next)).not.toThrow();
    expect(req.body).toEqual({
      username: { ne: "x" },
      nested: { value: "ok" },
    });
    expect(req.params).toEqual({ lessonId: { gt: "bad" } });
    expect(req.query).toEqual({ search: { regex: "x" } });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
