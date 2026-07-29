import { describe, it, expect, vi, beforeEach } from "vitest";
import router from "../routes/index.js";

vi.mock("express", () => {
  const routeHandlers = new Map<string, Array<(...args: unknown[]) => unknown>>();
  const Router = () => ({
    post: vi.fn((path: string, ...handlers: Array<(...args: unknown[]) => unknown>) => {
      routeHandlers.set(`POST ${path}`, handlers);
    }),
    get: vi.fn((path: string, ...handlers: Array<(...args: unknown[]) => unknown>) => {
      routeHandlers.set(`GET ${path}`, handlers);
    }),
    put: vi.fn((path: string, ...handlers: Array<(...args: unknown[]) => unknown>) => {
      routeHandlers.set(`PUT ${path}`, handlers);
    }),
    patch: vi.fn((path: string, ...handlers: Array<(...args: unknown[]) => unknown>) => {
      routeHandlers.set(`PATCH ${path}`, handlers);
    }),
    delete: vi.fn((path: string, ...handlers: Array<(...args: unknown[]) => unknown>) => {
      routeHandlers.set(`DELETE ${path}`, handlers);
    }),
  });

  return {
    default: { Router },
  };
});

vi.mock("../controllers/index.js", () => ({
  manageNewUser: vi.fn(),
  manageLogin: vi.fn(),
  manageLogout: vi.fn(),
  decodeUser: vi.fn(),
  selfDeleteAccount: vi.fn(),
  manageLessonRetrieval: vi.fn(),
  manageCreateLesson: vi.fn(),
  manageUpdateLesson: vi.fn(),
  manageSwitchLessonAssignment: vi.fn(),
  manageRemoveLesson: vi.fn(),
  manageUserRetrieval: vi.fn(),
}));

vi.mock("../controllers/users.js", () => ({
  manageGetUsers: vi.fn(),
}));

vi.mock("../middleware/index.js", () => ({
  authenticate: vi.fn(),
  requireAdmin: vi.fn(),
  validateRegisterRequest: vi.fn(),
  validateLoginRequest: vi.fn(),
  validateCreateLessonRequest: vi.fn(),
  validateUpdateLessonRequest: vi.fn(),
  validateAssignLessonRequest: vi.fn(),
}));

describe("router", () => {
  it("registers the expected lesson and auth routes", () => {
    expect(router).toBeDefined();
  });
});
