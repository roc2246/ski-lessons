import * as models from "../models/index.js";
import * as utilities from "../utilities/index.js";
import jwt from "jsonwebtoken";

// ======== AUTHENTICATION FUNCTIONS ======== //

/**
 * Registers a new user by creating an account with a hashed password.
 *
 * @param {import("express").Request} req - Express request object containing `username`,`password`, and `admin` in `req.body`.
 * @param {import("express").Response} res - Express response object used to send status and data.
 *
 * @returns {void}
 *
 * @example
 * POST /register
 * {
 *   "username": "demoUser",
 *   "password": "securePass",
 *   "admin": true
 * }
 *
 * Response:
 * {
 *   "message": "demoUser registered"
 * }
 */
export async function manageNewUser(req, res) {
  try {
    const { username, password, admin } = req.body;

    await models.newUser(username, password, admin);

    res.status(201).json({
      message: `${username} registered`,
    });
  } catch (error) {
    utilities.httpErrorMssg(res, 401, "Failed to register user", error);
  }
}

/**
 * Controller: decodeUser
 *
 * Decodes the JWT from the Authorization header and retrieves user credentials.
 * The password is kept internally for backend use but **not exposed** in the API response.
 *
 * @param {import('express').Request} req - Express request object, expects JWT in `Authorization` header.
 * @param {import('express').Response} res - Express response object used to send status and credentials.
 *
 * @returns {void}
 *
 * @example
 * GET /user/decode
 * Headers:
 *   Authorization: Bearer <JWT token>
 *
 * Response (200 OK):
 * {
 *   "message": "Retrieved credentials for adminUser",
 *   "credentials": {
 *     "username": "adminUser",
 *     "admin": true,
 *     "userId": "64d0f64abc1234567890abcd"
 *   }
 * }
 *
 * @throws Returns HTTP 401 if the token is missing or invalid.
 * @throws Returns HTTP 500 if decoding fails unexpectedly.
 */
export async function decodeUser(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.httpErrorMssg(
        res,
        401,
        "Unauthorized: No token provided"
      );
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return utilities.httpErrorMssg(res, 401, "Unauthorized: Invalid token");
    }

    // Internal credentials (password kept internally for backend use)
    const internalCredentials = {
      userId: decoded.userId,
      username: decoded.username,
      admin: decoded.admin,
    };

    // Expose only safe fields to the frontend
    const exposedCredentials = {
      userId: internalCredentials.userId,
      username: internalCredentials.username,
      admin: internalCredentials.admin,
    };

    return res.status(200).json({
      message: `Retrieved credentials for ${exposedCredentials.username}`,
      credentials: exposedCredentials,
    });
  } catch (error) {
    utilities.httpErrorMssg(res, 500, "Failed to retrieve credentials", error);
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

/**
 * Controller: selfDeleteAccount
 *
 * Allows a user to delete their own account. Requires a valid JWT
 * in the `Authorization` header (Bearer token). This controller
 * does not handle logout/blacklisting — tokens should expire naturally
 * or be blacklisted elsewhere if needed.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function selfDeleteAccount(req, res) {
  try {
    // Validate Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.httpErrorMssg(
        res,
        401,
        "Unauthorized: No token provided"
      );
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return utilities.httpErrorMssg(res, 401, "Unauthorized: Invalid token");
    }

    const username = decoded.username;
    const id = decoded.userId

    const lessons = await models.retrieveLessons({assignedTo: id})

    for (let x = 0; x < lessons.length; x++){
       await models.switchLessonAssignment(lessons[x]._id+ "", "None")
    }

    // Delete user
    const deleteConfirmation = await models.deleteUser(username);

    return res.status(200).json({
      message: `User "${username}" deleted successfully`,
      // deleteConfirmation,
    });
  } catch (error) {
    console.log(error)
    return utilities.httpErrorMssg(res, 400, "Failed to delete user", error);
  }
}

// ======== CRUD FUNCTIONS ======== //

/**
 * Handles creation of a new lesson for the authenticated user.
 *
 * This controller requires a valid JWT in the `Authorization` header (Bearer token).
 * The authenticated user's ID will be automatically assigned to the lesson.
 *
 * @param {import("express").Request} req - Express request object.
 *   - Headers: `Authorization: Bearer <JWT token>` (required)
 *   - Body: `{ lessonData: Object }` (required) — the details of the lesson to create.
 *
 * @param {import("express").Response} res - Express response object used to send status and data.
 *
 * @returns {void}
 *
 * @example
 * POST /create-lesson
 * Headers:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR...
 * Body:
 * {
 *   "lessonData": {
 *     "title": "Beginner Snowboarding",
 *     "date": "2025-12-20",
 *     "duration": 9-12,
 *     "location": "Adult Group Lesson"
 *   }
 * }
 *
 * Response (201 Created):
 * {
 *   "message": "lesson created successfully",
 *   "lessonDetails": {
 *     "title": "Beginner Snowboarding",
 *     "date": "2025-12-20",
 *     "duration": 9-12,
 *     "location": "Adult Group Lesson",
 *     "assignedTo": "64d0f64abc1234567890abcd"
 *   }
 * }
 *
 * @throws Returns HTTP 422 if lesson creation fails.
 */
export async function manageCreateLesson(req, res) {
  try {
    const lessonData = { ...req.body.lessonData };

    const createdLesson = await models.createLesson(lessonData);

    return res.status(201).json({
      message: "Lesson created successfully",
      lesson: createdLesson,
    });
  } catch (error) {
    utilities.httpErrorMssg(res, 422, "Failed to create lesson", error);
  }
}

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
    const availableHeader = req.headers.available;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.httpErrorMssg(
        res,
        401,
        "Unauthorized: No token provided"
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return utilities.httpErrorMssg(res, 401, "Unauthorized: Invalid token");
    }

    const userId = decoded.userId;

    const lessons = availableHeader
      ? await models.retrieveLessons({})
      : await models.retrieveLessons({ assignedTo: userId });

    res.status(200).json({
      message: `Lessons retrieved for user ID ${userId}`,
      lessons,
    });
  } catch (error) {
    utilities.httpErrorMssg(res, 400, "Failed to retrieve lessons", error);
  }
}

/**
 * Retrieves all users.
 *
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object used to send user data.
 *
 * @returns {void}
 *
 * @example
 * GET /users
 *
 * Response:
 * {
 *   "message": "Users retrieved",
 *   "users": [ ... ]
 * }
 */
export async function manageUserRetrieval(req, res) {
  try {
    const users = await models.retrieveUsers();

    res.status(200).json({
      message: `Users retrieved`,
      users,
    });
  } catch (error) {
    utilities.httpErrorMssg(res, 400, "Failed to retrieve users", error);
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
      return utilities.httpErrorMssg(
        res,
        400,
        "Missing lessonId in request parameters"
      );
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return utilities.httpErrorMssg(
        res,
        401,
        "Unauthorized: No token provided"
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return utilities.httpErrorMssg(res, 401, "Unauthorized: Invalid token");
    }

    const newUserId = decoded.userId;

    const updatedLesson = await models.switchLessonAssignment(
      lessonId,
      newUserId
    );

    return res.status(200).json({
      message: "Lesson assignment updated",
      lesson: updatedLesson,
    });
  } catch (error) {
    return utilities.httpErrorMssg(
      res,
      400,
      "Failed to switch lesson assignment",
      error
    );
  }
}
