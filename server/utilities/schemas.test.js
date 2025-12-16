import { describe, it, expect } from "vitest";
import { LessonSchema, UserSchema } from "./schemas.js";

describe("Schemas", () => {
  it("LessonSchema has correct fields", () => {
    const paths = Object.keys(LessonSchema.paths);
    expect(paths).toEqual(
      expect.arrayContaining([
        "type",
        "date",
        "timeLength",
        "guests",
        "assignedTo",
      ])
    );
  });

  it("UserSchema has correct fields", () => {
    const paths = Object.keys(UserSchema.paths);
    expect(paths).toEqual(
      expect.arrayContaining(["username", "password", "admin"])
    );
  });
});
