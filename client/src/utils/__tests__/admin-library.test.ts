import {
  describe,
  it,
  vi,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import * as lib from "../admin-library";
import { UNASSIGNED_LESSON_VALUE } from "../../types/domain";
import type { Lesson, LessonMutationInput, User } from "../../types/domain";

const fetchMock = vi.fn<typeof fetch>();
const storage = new Map<string, string>();

const localStorageMock: Storage = {
  get length() {
    return storage.size;
  },
  clear() {
    storage.clear();
  },
  getItem(key) {
    return storage.get(key) ?? null;
  },
  key(index) {
    return Array.from(storage.keys())[index] ?? null;
  },
  removeItem(key) {
    storage.delete(key);
  },
  setItem(key, value) {
    storage.set(key, value);
  },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function buildLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    _id: "lesson-1",
    type: "beginner",
    date: "2025-12-20",
    timeLength: "9-12",
    guests: 2,
    assignedTo: null,
    ...overrides,
  };
}

function buildLessonInput(overrides: Partial<LessonMutationInput> = {}): LessonMutationInput {
  return {
    type: "beginner",
    date: "2025-12-20",
    timeLength: "9-12",
    guests: 2,
    assignedTo: UNASSIGNED_LESSON_VALUE,
    ...overrides,
  };
}

beforeAll(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("localStorage", localStorageMock);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  fetchMock.mockReset();
  localStorage.clear();
  localStorage.setItem("token", "any-token");
});


// =====================
// isAdmin
// =====================
describe("isAdmin", () => {
  it("should call fetch with correct arguments", async () => {
    const fakeToken = "fakeToken123";

    fetchMock.mockResolvedValue(jsonResponse({ credentials: { admin: true } }));

    const result = await lib.isAdmin(fakeToken);

    expect(fetchMock).toHaveBeenCalledWith("/api/users/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fakeToken}`,
      },
    });

    expect(result).toBe(true);
  });

  it("should return false if admin is false", async () => {
    const fakeToken = "fakeToken456";

    fetchMock.mockResolvedValue(jsonResponse({ credentials: { admin: false } }));

    const result = await lib.isAdmin(fakeToken);
    expect(result).toBe(false);
  });

  it("should throw an error if fetch returns non-ok", async () => {
    const fakeToken = "fakeToken789";

    fetchMock.mockResolvedValue(jsonResponse({ message: "Unauthorized access" }, 401));

    await expect(lib.isAdmin(fakeToken)).rejects.toThrow(
      "Unauthorized access"
    );
  });

  it("should throw an error if fetch rejects (network error)", async () => {
    const error = new Error("Network failure");

    fetchMock.mockRejectedValue(error);

    await expect(lib.isAdmin("fakeToken")).rejects.toThrow(
      "Network failure"
    );
  });

  it("should throw an error if token is missing", async () => {
    await expect(lib.isAdmin("")).rejects.toThrow(
      "No auth token provided"
    );
  });

  it("should log an error on fetch failure", async () => {
    const error = new Error("Network failure");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchMock.mockRejectedValue(error);

    await expect(lib.isAdmin("fakeToken")).rejects.toThrow(
      "Network failure"
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error checking admin status:",
      error
    );

    consoleSpy.mockRestore();
  });
});


// =====================
// lessonCreate
// =====================
describe("lessonCreate", () => {
  it("should call fetch with correct arguments", async () => {
    const lessonData = buildLessonInput({ assignedTo: "user123" });
    const expectedLesson = buildLesson({ assignedTo: "user123" });

    fetchMock.mockResolvedValue(jsonResponse({ lesson: expectedLesson }));

    const result = await lib.lessonCreate(lessonData);

    expect(fetchMock).toHaveBeenCalledWith("/api/lessons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer any-token",
      },
      body: JSON.stringify({
        lessonData: {
          ...lessonData,
          assignedTo: "user123",
        },
      }),
    });

    expect(result).toEqual(expectedLesson);
  });

  it("should throw an error if fetch returns non-ok", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Failed to create lesson" }, 400));

    await expect(lib.lessonCreate(buildLessonInput({ type: "intermediate" }))).rejects.toThrow(
      "Failed to create lesson"
    );
  });

  it("should throw on network failure", async () => {
    const error = new Error("Network failure");
    fetchMock.mockRejectedValue(error);

    await expect(lib.lessonCreate(buildLessonInput({ type: "advanced" }))).rejects.toThrow(
      "Network failure"
    );
  });

  it("should log error on fetch failure", async () => {
    const error = new Error("Network failure");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchMock.mockRejectedValue(error);

    await expect(lib.lessonCreate(buildLessonInput({ type: "expert" }))).rejects.toThrow(
      "Network failure"
    );

    expect(consoleSpy).toHaveBeenCalledWith("Error during lesson creation:", error);

    consoleSpy.mockRestore();
  });

  it("should throw if lesson field is missing on successful response", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "ok" }));

    await expect(lib.lessonCreate(buildLessonInput())).rejects.toThrow("Malformed response: missing lesson field");
  });
});

// =====================
// lessonUpdate
// =====================
describe("lessonUpdate", () => {
  it("should call fetch with correct arguments", async () => {
    const lessonId = "lesson123";
    const lessonData: LessonMutationInput = {
      type: "advanced",
      date: "2026-01-11",
      timeLength: "1-4",
      guests: 2,
      assignedTo: UNASSIGNED_LESSON_VALUE,
    };

    fetchMock.mockResolvedValue(jsonResponse({
      lesson: buildLesson({ _id: lessonId, ...lessonData, assignedTo: null }),
    }));

    const result = await lib.lessonUpdate(lessonId, lessonData);

    expect(fetchMock).toHaveBeenCalledWith(`/api/lessons/${lessonId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer any-token",
      },
      body: JSON.stringify({
        lessonData: {
          ...lessonData,
          assignedTo: null,
        },
      }),
    });

    expect(result).toEqual({
      _id: lessonId,
      ...lessonData,
      assignedTo: null,
    });
  });

  it("should throw an error if fetch returns non-ok", async () => {
    const lessonId = "lesson123";

    fetchMock.mockResolvedValue(jsonResponse({ message: "Failed to update lesson" }, 400));

    await expect(
      lib.lessonUpdate(lessonId, {
        type: "advanced",
        date: "2026-01-11",
        timeLength: "1-4",
        guests: 2,
        assignedTo: null,
      })
    ).rejects.toThrow("Failed to update lesson");
  });
});


// =====================
// getUsers
// =====================
describe("getUsers", () => {
  it("should call fetch with correct arguments", async () => {
    const users: User[] = [
      { _id: "1", username: "John", admin: false },
      { _id: "2", username: "Sarah", admin: true },
    ];

    fetchMock.mockResolvedValue(jsonResponse({ message: "Users retrieved", users }));

    const result = await lib.getUsers();

    expect(fetchMock).toHaveBeenCalledWith("/api/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer any-token",
      },
    });

    expect(result).toEqual(users);
  });

  it("should throw if users field is missing", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Users retrieved" }));

    await expect(lib.getUsers()).rejects.toThrow(
      "Malformed response: missing users field"
    );
  });

  it("should throw on fetch failure", async () => {
    const error = new Error("Network failure");
    fetchMock.mockRejectedValue(error);

    await expect(lib.getUsers()).rejects.toThrow("Network failure");
  });

  it("should log error on fetch rejection", async () => {
    const error = new Error("Network failure");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchMock.mockRejectedValue(error);

    await expect(lib.getUsers()).rejects.toThrow("Network failure");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error retrieving users:",
      error
    );

    consoleSpy.mockRestore();
  });

  it("should return users exactly as provided", async () => {
    const users: User[] = [
      { _id: "1", username: "Test A", admin: false },
      { _id: "2", username: "Test B", admin: false },
    ];

    fetchMock.mockResolvedValue(jsonResponse({ message: "Users retrieved", users }));

    const result = await lib.getUsers();
    expect(result).toEqual(users);
  });
});
