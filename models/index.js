/**
 * MODEL FUNCTIONS
 *
 * DESCRIPTION: This module contains all functions responsible for
 * interacting with the database, organized into:
 *  - DB connection functions
 *  - Authentication functions (register/login)
 *  - CRUD functions
 */

import * as utilities from "../utilities/index.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { errorEmail } from "../email/index.js";

// Emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({
  path: path.join(__dirname, "../config/.env"),
});

// ======== DB CONNECTION ======== //

export async function dbConnect() {
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
export async function newUser(username, password) {
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
export async function loginUser(username, password) {
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
      { userId: userCreds[0]._id.toString(), username: userCreds[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return token;
  } catch (error) {
    throw error;
  }
}

/**
 * Logout user by blacklisting the token.
 * Requires an instance of TokenBlacklist to manage blacklisted tokens.
 * @param {TokenBlacklist} blacklist Instance of TokenBlacklist
 * @param {string} token JWT token string to blacklist
 */
export async function logoutUser(blacklist, token) {
  try {
    utilities.argValidation([blacklist, token], [`Blacklist`, `Token`]);
    blacklist.add(token);
  } catch (error) {
    throw error;
  } finally {
    mongoose.disconnect();
  }
}

// Export a factory to create new blacklist instances
export function createTokenBlacklist() {
  return new utilities.TokenBlacklist();
}

// ======== CRUD FUNCTIONS ======== //

/**
 * Creates a new lesson document in the database.
 *
 * @param {Object} lessonData - Lesson info
 * @param {string} lessonData.type
 * @param {string} lessonData.date
 * @param {string} lessonData.timeLength
 * @param {number} lessonData.guests
 * @param {string} lessonData.assignedTo
 * @returns {Promise<Object>}
 */
export async function createLesson(lessonData) {
  try {
    const requiredFields = ["type", "date", "timeLength", "guests", "assignedTo"];
    const values = requiredFields.map((field) => lessonData[field]);
    utilities.argValidation(values, requiredFields.map(f => f[0].toUpperCase() + f.slice(1)));

    const lessonModel = utilities.getModel(utilities.schemas().Lesson, "Lesson");

    const newLesson = new lessonModel({
      type: lessonData.type,
      date: lessonData.date,
      timeLength: lessonData.timeLength,
      guests: lessonData.guests,
      assignedTo: lessonData.assignedTo,
    });

    await newLesson.save();

    return newLesson;
  } catch (error) {
    await errorEmail("Failed to create lesson", error.toString());
    throw error;
  }
}

/**
 * Retrieves all lessons assigned to a specific user/instructor by ID.
 *
 * @param {string} id - The instructor's user ID
 * @returns {Promise<Array<Object>>}
 */
export async function retrieveLessons(id) {
  try {
    utilities.argValidation([id], ["ID"]);
    if (typeof id !== "string") throw new Error("ID must be a string");

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

/**
 * Switches the assigned instructor/user for a lesson.
 *
 * @param {string} lessonId - The lesson's ObjectId string
 * @param {string} newUserId - The new user's ObjectId string
 * @returns {Promise<Object>} - Updated lesson document
 */
export async function switchLessonAssignment(lessonId, newUserId) {
  try {
    utilities.argValidation([lessonId, newUserId], ["Lesson ID", "New User ID"]);
    if (typeof lessonId !== "string") throw new Error("Lesson ID must be a string");
    if (typeof newUserId !== "string") throw new Error("New User ID must be a string");

    const lessonModel = utilities.getModel(utilities.schemas().Lesson, "Lesson");

    const updatedLesson = await lessonModel.findByIdAndUpdate(
      lessonId,
      { assignedTo: newUserId },
      { new: true }
    );

    if (!updatedLesson) throw new Error("Lesson not found");

    return updatedLesson;
  } catch (error) {
    await errorEmail("Failed to switch lesson assignment", error.toString());
    throw error;
  }
}

/**
 * Deletes a lesson from the database by its unique ID.
 *
 * @param {string} id - The lesson ID to delete
 * @returns {Promise<Object>} - Deletion confirmation and deleted lesson
 */
export async function removeLesson(id) {
  try {
    utilities.argValidation([id], ["Lesson ID"]);
    if (typeof id !== "string") throw new Error("Lesson ID must be a string");

    const lessonModel = utilities.getModel(utilities.schemas().Lesson, "Lesson");

    const deletedLesson = await lessonModel.findByIdAndDelete(id);
    if (!deletedLesson) throw new Error("Lesson not found or already deleted");

    return { success: true, message: "Lesson successfully removed", lesson: deletedLesson };
  } catch (error) {
    await errorEmail("Failed to remove lesson", error.toString());
    throw error;
  }
}
