import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMailMock = vi.fn();
const createTransportMock = vi.fn(() => ({ sendMail: sendMailMock }));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

vi.mock("dotenv", () => ({
  default: {
    config: vi.fn(),
  },
}));

describe("errorEmail", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.SMTP_USER;
    delete process.env.APP_PASSWORD;
  });

  it("returns false when SMTP credentials are missing", async () => {
    const mod = await import("../index.js");

    const result = await mod.errorEmail("Subject", "Body");

    expect(result).toBe(false);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("returns true when email sends successfully", async () => {
    process.env.SMTP_USER = "sender@example.com";
    process.env.APP_PASSWORD = "app-password";
    sendMailMock.mockResolvedValueOnce({ response: "250 OK" });

    const mod = await import("../index.js");

    const result = await mod.errorEmail("Subject", "Body", "target@example.com");

    expect(result).toBe(true);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "sender@example.com",
        to: "target@example.com",
        subject: "Subject",
        text: "Body",
      })
    );
  });

  it("returns false when nodemailer sendMail throws", async () => {
    process.env.SMTP_USER = "sender@example.com";
    process.env.APP_PASSWORD = "app-password";
    sendMailMock.mockRejectedValueOnce(new Error("smtp failure"));

    const mod = await import("../index.js");

    const result = await mod.errorEmail("Subject", "Body");

    expect(result).toBe(false);
  });
});
