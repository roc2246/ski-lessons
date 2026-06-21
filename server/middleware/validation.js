import * as utilities from "../utilities/index.js";

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;
const LESSON_TYPES = new Set(["beginner", "intermediate", "advanced", "expert"]);
const LESSON_WINDOWS = new Set(["9-12", "1-4", "9-4"]);

function ensureString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateRegisterRequest(req, res, next) {
  const username = ensureString(req.body?.username);
  const password = ensureString(req.body?.password);

  if (!username || username.length < 3) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Username must be at least 3 characters"));
  }

  if (!password || password.length < 6) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Password must be at least 6 characters"));
  }

  req.body.username = username;
  req.body.password = password;
  req.body.admin = false;
  next();
}

export function validateLoginRequest(req, res, next) {
  const username = ensureString(req.body?.username);
  const password = ensureString(req.body?.password);

  if (!username || !password) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Username and password are required"));
  }

  req.body.username = username;
  req.body.password = password;
  next();
}

export function validateCreateLessonRequest(req, res, next) {
  const lessonData = req.body?.lessonData;
  if (!lessonData || typeof lessonData !== "object") {
    return utilities.sendError(res, 400, "Validation failed", new Error("lessonData is required"));
  }

  const type = ensureString(lessonData.type);
  const timeLength = ensureString(lessonData.timeLength);
  const date = ensureString(lessonData.date);
  const guests = Number(lessonData.guests);
  const assignedTo = lessonData.assignedTo;

  if (!LESSON_TYPES.has(type)) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Invalid lesson type"));
  }

  if (!LESSON_WINDOWS.has(timeLength)) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Invalid lesson timeLength"));
  }

  if (!date || Number.isNaN(Date.parse(date))) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Invalid lesson date"));
  }

  if (!Number.isInteger(guests) || guests < 1 || guests > 12) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Guests must be an integer from 1 to 12"));
  }

  const assignedToValid =
    assignedTo === null ||
    assignedTo === undefined ||
    assignedTo === "" ||
    (typeof assignedTo === "string" && OBJECT_ID_REGEX.test(assignedTo));

  if (!assignedToValid) {
    return utilities.sendError(res, 400, "Validation failed", new Error("assignedTo must be null or a valid user id"));
  }

  const normalizedAssignedTo =
    assignedTo === undefined || assignedTo === ""
      ? null
      : assignedTo;

  req.body.lessonData = {
    ...lessonData,
    type,
    timeLength,
    date,
    guests,
    assignedTo: normalizedAssignedTo,
  };

  next();
}

export function validateAssignLessonRequest(req, res, next) {
  const lessonId = ensureString(req.params?.lessonId);

  if (!OBJECT_ID_REGEX.test(lessonId)) {
    return utilities.sendError(res, 400, "Validation failed", new Error("Invalid lessonId"));
  }

  req.params.lessonId = lessonId;
  next();
}
