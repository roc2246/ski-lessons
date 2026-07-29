import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import GeneralBtn from "../GeneralBtn";
import SubmitBtn from "../SubmitBtn";

describe("button components", () => {
  it("renders GeneralBtn with variant class", () => {
    const html = renderToStaticMarkup(
      <GeneralBtn type="danger" onClick={() => {}}>
        Delete
      </GeneralBtn>
    );

    expect(html).toContain("btn--danger");
    expect(html).toContain("Delete");
  });

  it("renders SubmitBtn with page-specific class", () => {
    const html = renderToStaticMarkup(
      <SubmitBtn type="login">Login</SubmitBtn>
    );

    expect(html).toContain("type=\"submit\"");
    expect(html).toContain("login__submit");
    expect(html).toContain("Login");
  });
});
