/**
 * MODEL FUNCTIONS
 *
 * DESCRIPTION: This module contains all functions responsible for
 * interacting with the database, organized into:
 *  - DB connection functions
 *  - Authentication functions (register/login)
 *  - CRUD functions (to be added)
 */

import utilities from "./utilities";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { errorEmail } from "../email";

require("dotenv").config({
  path: path.join(__dirname, "../config/.env"),
});

// ======== DB CONNECTION ======== //
async function dbConnect() {
  try {
    const db = { dbName: "ski-lessons" };
    await mongoose.connect(process.env.URI, db);
  } catch (error) {
    console.error("DB connection error:", error);
    await errorEmail("Connection Failed", error.toString());
    throw error;
  }
}

// ======== AUTHENTICATION FUNCTIONS ======== //

/**
 * Creates a new user with a hashed password.
 * @param {string} username
 * @param {string} password
 */
async function newUser(username, password) {
  try {
    utilities.argValidation([username, password], ["Username", "Password"]);

    await dbConnect();

    const UserModel = utilities.getModel(utilities.schemas().User, "User");

    const userInDB = await UserModel.find({ username });
    if (userInDB.length > 0) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new UserModel({ username, password: hashedPassword });

    await newUser.save();
  } catch (error) {
    await errorEmail("Failed to register user", error.toString());
    throw error;
  }
}

/**
 * Logs in a user by verifying their credentials and returning a JWT.
 * @param {string} username
 * @param {string} password
 * @returns {string} JWT
 */
async function loginUser(username, password) {
  try {
    utilities.argValidation([username, password], ["Username", "Password"]);

    await dbConnect();

    const UserModel = utilities.getModel(utilities.schemas().User, "User");

    const userCreds = await UserModel.find({ username });
    if (userCreds.length === 0)
      throw new Error("User or password doesn't match");

    const passwordMatch = await bcrypt.compare(password, userCreds[0].password);
    if (!passwordMatch) throw new Error("User or password doesn't match");

    const token = jwt.sign(
      { username: userCreds[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return token;
  } catch (error) {
    await errorEmail("Login failed", error.toString());
    throw error;
  }
}

// Export a factory to create new blacklist instances
function createTokenBlacklist() {
  return new utilities.TokenBlacklist();
}

/**
 * Logout user by blacklisting the token.
 * Requires an instance of TokenBlacklist to manage blacklisted tokens.
 * @param {TokenBlacklist} blacklist Instance of TokenBlacklist
 * @param {string} token JWT token string to blacklist
 */
async function logoutUser(blacklist, token) {
  try {
    utilities.argValidation([blacklist, token], [`Blacklist`, `Token`]);
    blacklist.add(token);
  } catch (error) {
    throw error;
  } finally {
    mongoose.disconnect();
  }
}

// ======== CRUD FUNCTIONS ======== //
/**
 * Retrieves all lessons assigned to a specific user/instructor by ID.
 *
 * DESCRIPTION: This function connects to the database, retrieves the Lesson model,
 * and finds all documents where the `assignedTo` field matches the provided ID.
 *
 * @param {string} id - The ID of the user/instructor whose lessons are being fetched.
 *
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of lesson documents.
 *
 * @throws {Error} - Throws an error if the ID is invalid, if the query fails,
 *                   or if there is any issue during the process.
 *
 * @example
 *   const lessons = await retrieveLessons("64d0f64abc1234567890abcd");
 */
async function retrieveLessons(id) {
  try {
    utilities.argValidation([id], ["ID"]);

    const lessonModel = utilities.getModel(
      utilities.schemas().Lesson,
      "Lesson"
    );
    const lessons = await lessonModel.find({ assignedTo: id });

    return lessons;
  } catch (error) {
    await errorEmail("Failed to retrieve lessons", error.toString());
    throw error;
  }
}


// ======== EXPORTS ======== //
module.exports = {
  dbConnect,
  newUser,
  loginUser,
  logoutUser,
  createTokenBlacklist,
  retrieveLessons,
};
