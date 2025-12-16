import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { TokenBlacklist } from "./jwt.js";

describe("TokenBlacklist", () => {
  it("adds a token and checks it", () => {
    const blacklist = new TokenBlacklist();

    const token = jwt.sign({ data: "test" }, "secret", { expiresIn: "1h" });
    blacklist.add(token);

    expect(blacklist.has(token)).toBe(true);
    blacklist.stop();
  });

  it("removes expired tokens automatically", () => {
    const blacklist = new TokenBlacklist();

    const token = jwt.sign({ data: "test", exp: Math.floor(Date.now() / 1000) - 10 }, "secret");
    blacklist.add(token);

    expect(blacklist.has(token)).toBe(false);
    blacklist.stop();
  });
});
