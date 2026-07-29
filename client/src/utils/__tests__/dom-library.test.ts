// @vitest-environment jsdom
// @ts-nocheck

import { describe, it, expect } from "vitest";
import { createOption } from "../dom-library";

describe("createOption", () => {
  it("creates and appends an option element with the provided value and text", () => {
    const select = document.createElement("select");

    createOption(select, "ski", "Ski Lesson");

    expect(select.children).toHaveLength(1);
    expect(select.children[0].tagName).toBe("OPTION");
    expect(select.children[0].value).toBe("ski");
    expect(select.children[0].innerText).toBe("Ski Lesson");
  });
});
