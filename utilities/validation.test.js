import { describe, it, expect } from "vitest";
import { argValidation, dataTypeValidation } from "./validation.js";

describe("argValidation", () => {
  it("throws if a value is undefined or null", () => {
    expect(() =>
      argValidation([undefined], ["Test"])
    ).toThrow("Test required");

    expect(() =>
      argValidation([null], ["Test"])
    ).toThrow("Test required");
  });

  it("does not throw for valid values", () => {
    expect(() =>
      argValidation(["value"], ["Test"])
    ).not.toThrow();
  });
});

describe("dataTypeValidation", () => {
  it("throws if value type doesn't match", () => {
    expect(() =>
      dataTypeValidation([123], ["Age"], ["string"])
    ).toThrow("Age must be a string");
  });

  it("does not throw if types match", () => {
    expect(() =>
      dataTypeValidation([123], ["Age"], ["number"])
    ).not.toThrow();
  });
});
