import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";
import jwt from "jsonwebtoken";

// ======== AUTHENTICATION FUNCTIONS ======== //

/**
 * Registers a new user by creating an account with a hashed password.
 *
 * @param {import("express").Request} req - Express request object containing `username` and `password` in `req.body`.
 * @param {import("express").Response} res - Express response object used to send status and data.
 *
 * @returns {void}
 *
 * @example
 * POST /register
 * {
 *   "username": "demoUser",
 *   "password": "securePass"
 * }
 *
 * Response:
 * {
 *   "message": "demoUser registered"
 * }
 */
export async function manageNewUser(req, res) {
  try {
    const { username, password } = req.body;

    await models.newUser(username, password);

    res.status(201).json({
      message: `${username} registered`,
    });
  } catch (error) {
    utilities.httpErrorMssg(res, 401, "Failed to register user", error);
  }
}

/**
 * Handles user login by validating credentials and returning a JWT.
 *
 * @param {import("express").Request} req - Express request object expecting `username` and `password` in `req.body`.
 * @param {import("express").Response} res - Express response object used to send status and JWT token.
 *
 * @returns {void}
 *
 * @example
 * POST /login
 * {
 *   "username": "demoUser",
 *   "password": "securePass"
 * }
 *
 * Response:
 * {
 *   "message": "Login successful",
 *   "token": "eyJhbGciOiJIUzI1NiIsInR..."
 * }
 */
export async function manageLogin(req, res) {
  try {
    const { username, password } = req.body;

    const token = await models.loginUser(username, password);

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    utilities.httpErrorMssg(res, 401, "Login failed", error);
  }
}

/**
 * Logs out a user by blacklisting their JWT token.
 *
 * @param {import("express").Request} req - Express request object expecting JWT in the `Authorization` header.
 * @param {import("express").Response} res - Express response object used to send status response.
 *
 * @returns {void}
 *
 * @example
 * POST /logout
 * Headers: { Authorization: "Bearer eyJhbGciOi..." }
 *
 * Response:
 * {
 *   "message": "Successfully logged out"
 * }
 */
export async function manageLogout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.httpErrorMssg(
        res,
        400,
        "Logout failed",
        "Missing or invalid Authorization header"
      );
    }

    const token = authHeader.split(" ")[1];
    const blacklist = models.createTokenBlacklist();

    await models.logoutUser(blacklist, token);

    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    utilities.httpErrorMssg(res, 400, "Logout failed", error);
  }
}

// ======== CRUD FUNCTIONS ======== //

/**
 * Retrieves all lessons assigned to the currently authenticated user.
 *
 * @param {import("express").Request} req - Express request object, expects JWT token in `Authorization` header.
 * @param {import("express").Response} res - Express response object used to send lessons data.
 *
 * @returns {void}
 *
 * @example
 * POST /lessons
 * Headers: { Authorization: "Bearer eyJhbGciOi..." }
 *
 * Response:
 * {
 *   "message": "Lessons retrieved for user ID 64d0f64abc1234567890abcd",
 *   "lessons": [ ... ]
 * }
 */
export async function manageLessonRetrieval(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.httpErrorMssg(res, 401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return utilities.httpErrorMssg(res, 401, "Unauthorized: Invalid token");
    }

    const userId = decoded.userId;

    const lessons = await models.retrieveLessons(userId);

    res.status(200).json({
      message: `Lessons retrieved for user ID ${userId}`,
      lessons,
    });
  } catch (error) {
    utilities.httpErrorMssg(res, 400, "Failed to retrieve lessons", error);
  }
}

/**
 * Switches the assigned user of a lesson to the authenticated user.
 *
 * @param {import("express").Request} req - Express request object,
 *   expects `lessonId` in URL params. Authenticated user's ID is taken from JWT.
 * @param {import("express").Response} res - Express response object used to send status and updated lesson data.
 *
 * @returns {Promise<void>}
 *
 * @example
 * PATCH /lessons/:lessonId/assign
 *
 * Headers:
 *   Authorization: Bearer <token>
 *
 * Response:
 * {
 *   "message": "Lesson assignment updated",
 *   "lesson": { ...updated lesson object... }
 * }
 */
export async function manageSwitchLessonAssignment(req, res) {
  try {
    const { lessonId } = req.params;

    if (!lessonId) {
      return utilities.httpErrorMssg(res, 400, "Missing lessonId in request parameters");
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.httpErrorMssg(res, 401, "Unauthorized: No token provided");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return utilities.httpErrorMssg(res, 401, "Unauthorized: Invalid token");
    }

    const newUserId = decoded.userId;

    const updatedLesson = await models.switchLessonAssignment(lessonId, newUserId);

    return res.status(200).json({
      message: "Lesson assignment updated",
      lesson: updatedLesson,
    });
  } catch (error) {
    return utilities.httpErrorMssg(res, 400, "Failed to switch lesson assignment", error);
  }
}


