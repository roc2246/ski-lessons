/**
 * CONTROLLER FUNCTIONS
 *
 * DESCRIPTION: This module handles incoming HTTP requests and responses.
 * Controllers act as the intermediary between client requests and model logic.
 *
 * ORGANIZED INTO:
 *  - Authentication controllers (e.g., login)
 *  - CRUD controllers (to be added)
 */

import * as models from "./models";
import * as utilities from "./utilities";

// ======== AUTHENTICATION FUNCTIONS ======== //

/**
 * Registers a new user by creating an account with a hashed password.
 *
 * DESCRIPTION: Extracts `username` and `password` from the request body,
 * calls the `newUser` model function to create a new user in the database,
 * and responds with a confirmation message. If registration fails, returns
 * a 401 status with an error message.
 *
 * @param {import("express").Request} req - Express request object with `username` and `password` in `req.body`
 * @param {import("express").Response} res - Express response object for sending status and data
 *
 * @returns {void}
 *
 * @example
 *   POST /register
 *   {
 *     "username": "demoUser",
 *     "password": "securePass"
 *   }
 *
 *   Response:
 *   {
 *     "message": "demoUser registered"
 *   }
 */
async function manageNewUser(req, res) {
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
 * DESCRIPTION: Extracts `username` and `password` from the request body,
 * calls the `loginUser` model function, and responds with a signed JWT token
 * if authentication is successful. Returns a 401 status code with an error
 * message if authentication fails.
 *
 * @param {import("express").Request} req - Express request object, expects `username` and `password` in `req.body`
 * @param {import("express").Response} res - Express response object used to send status and data back to the client
 *
 * @returns {void}
 *
 * @example
 *   POST /login
 *   {
 *     "username": "demoUser",
 *     "password": "securePass"
 *   }
 *
 *   Response:
 *   {
 *     "message": "Login successful",
 *     "token": "eyJhbGciOiJIUzI1NiIsInR..."
 *   }
 */
async function manageLogin(req, res) {
  try {
    const { username, password } = req.body;

    const token = await models.loginUser(username, password);

    res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    utilities.httpErrorMssg(res, 401, "Login failed", error);
  }
}

/**
 * Logs out a user by blacklisting their JWT token.
 *
 * DESCRIPTION: This function expects the token to be passed in the request headers (e.g., Authorization).
 * It uses an instance of `TokenBlacklist` to store the token so it can be invalidated on future requests.
 *
 * @param {import("express").Request} req - Express request object, expects JWT in the `Authorization` header
 * @param {import("express").Response} res - Express response object
 *
 * @returns {void}
 *
 * @example
 *   POST /logout
 *   Headers: { Authorization: "Bearer eyJhbGciOi..." }
 *
 *   Response:
 *   {
 *     "message": "Successfully logged out"
 *   }
 */
async function manageLogout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(400)
        .json({ message: "Missing or invalid Authorization header" });
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
 * Retrieves all lessons assigned to a specific user/instructor by ID.
 *
 * DESCRIPTION: Calls the `retrieveLessons` model function using the provided
 * user ID from the request body, then returns the lesson data in the response.
 *
 * @param {import("express").Request} req - Express request object, expects `id` in `req.body`
 * @param {import("express").Response} res - Express response object
 *
 * @returns {void}
 *
 * @example
 *   POST /lessons
 *   {
 *     "id": "64d0f64abc1234567890abcd"
 *   }
 *
 *   Response:
 *   {
 *     "message": "User ID 64d0f64abc1234567890abcd lessons retrieved",
 *     "lessons": [...]
 *   }
 */
async function manageLessonRetrieval(req, res) {
  try {
    const { id } = req.params;

    const lessons = await models.retrieveLessons(id);

    res.status(200).json({
      message: `User ID ${id} lessons retrieved`,
      lessons: lessons,
    });
  } catch (error) {
    utilities.httpErrorMssg(res, 400, "Failed to retrieve lessons", error);
  }
}

// ======== EXPORTS ======== //

module.exports = {
  manageNewUser,
  manageLogin,
  manageLogout,
  manageLessonRetrieval,
};
