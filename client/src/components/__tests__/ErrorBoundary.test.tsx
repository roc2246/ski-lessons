// @vitest-environment jsdom

import { act } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import ErrorBoundary from "../ErrorBoundary";

function Thrower(): ReactElement {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("renders children when no error is thrown", () => {
    act(() => {
      root.render(
        <ErrorBoundary>
          <div>safe content</div>
        </ErrorBoundary>
      );
    });

    expect(container.textContent).toContain("safe content");
  });

  it("renders fallback UI when a child throws", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    act(() => {
      root.render(
        <ErrorBoundary>
          <Thrower />
        </ErrorBoundary>
      );
    });

    expect(container.textContent).toContain("Something went wrong.");
    expect(container.textContent).toContain("Please refresh the page and try again.");

    errorSpy.mockRestore();
  });
});
