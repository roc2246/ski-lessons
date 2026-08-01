// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { getRequiredAuthToken } from "../token-library";

describe("getRequiredAuthToken", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the stored token when present", () => {
    localStorage.setItem("token", "abc123");

    expect(getRequiredAuthToken()).toBe("abc123");
  });

  it("throws the default message when token is missing", () => {
    expect(() => getRequiredAuthToken()).toThrow("No auth token provided");
  });

  it("throws a custom message when provided", () => {
    expect(() => getRequiredAuthToken("Login required")).toThrow("Login required");
  });
});
