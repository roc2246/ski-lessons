import { describe, expect, it } from "vitest";
import { parseDate } from "../migrate-lessons.js";

describe("parseDate", () => {
  it("parses valid date strings", () => {
    const value = parseDate("2024-01-02T03:04:05.000Z");

    expect(value).toBeInstanceOf(Date);
    expect(value?.toISOString()).toBe("2024-01-02T03:04:05.000Z");
  });

  it("returns null for invalid input", () => {
    expect(parseDate("not-a-date")).toBeNull();
    expect(parseDate(null)).toBeNull();
  });
});
