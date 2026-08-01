// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { createOption } from "../dom-library";

describe("createOption", () => {
  it("creates and appends an option element with the provided value and text", () => {
    const select = document.createElement("select");

    createOption(select, "ski", "Ski Lesson");

    const option = select.children[0] as HTMLOptionElement;

    expect(select.children).toHaveLength(1);
    expect(option.tagName).toBe("OPTION");
    expect(option.value).toBe("ski");
    expect(option.innerText).toBe("Ski Lesson");
  });
});
