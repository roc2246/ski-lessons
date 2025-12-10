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

export async function newUser(username, password, admin) {
  try {
    utilities.argValidation(
      [username, password, admin],
      ["Username", "Password", "Admin"]
    );

    const UserModel = utilities.getModel(utilities.UserSchema, "User");

    const userInDB = await UserModel.find({ username });
    if (userInDB.length > 0) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new UserModel({
      username,
      password: hashedPassword,
      admin,
    });

    await newUser.save();
  } catch (error) {
    await errorEmail("Failed to register user", error.toString());
    throw error;
  }
}

export async function loginUser(username, password) {
  try {
    utilities.argValidation([username, password], ["Username", "Password"]);

    const UserModel = utilities.getModel(utilities.UserSchema, "User");
    await dbConnect();
    const userCreds = await UserModel.find({ username });
    if (userCreds.length === 0)
      throw new Error("User or password doesn't match");

    const passwordMatch = await bcrypt.compare(password, userCreds[0].password);
    if (!passwordMatch) throw new Error("User or password doesn't match");

    const token = jwt.sign(
      {
        userId: userCreds[0]._id.toString(),
        username: userCreds[0].username,
        admin: userCreds[0].admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return token;
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(username) {
  try {
    utilities.argValidation([username], [`Username`]);

    const User = utilities.getModel(utilities.UserSchema, "User");
    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser)
      throw new Error(`No user found with username: ${username}`);
    return deletedUser;
  } catch (error) {
    throw error;
  }
}

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

export function createTokenBlacklist() {
  return new utilities.TokenBlacklist();
}

// ======== CRUD FUNCTIONS ======== //

export async function createLesson(lessonData) {
  try {
    const requiredFields = [
      "type",
      "date",
      "timeLength",
      "guests",
      "assignedTo",
    ];
    const values = requiredFields.map((field) => lessonData[field]);
    utilities.argValidation(
      values,
      requiredFields.map((f) => f[0].toUpperCase() + f.slice(1))
    );

    const lessonModel = utilities.getModel(utilities.LessonSchema, "Lesson");

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

export async function retrieveLessons(param) {
  try {
    utilities.argValidation([param], ["Param"]);
    utilities.dataTypeValidation([param], ["Param"], ["object"]);

    const lessonModel = utilities.getModel(utilities.LessonSchema, "Lesson");
    const lessons = await lessonModel.find(param);
    return lessons;
  } catch (error) {
    await errorEmail("Failed to retrieve lessons", error.toString());
    throw error;
  }
}

export async function retrieveUsers() {
  try {
    const userModel = utilities.getModel(utilities.UserSchema, "User");

    const users = await userModel.find({}).select("-password");
    return users;
  } catch (error) {
    await errorEmail("Failed to retrieve users", error.toString());
    throw error;
  }
}

export async function switchLessonAssignment(id, newUserId) {
  try {
    utilities.argValidation([id, newUserId], ["Lesson ID", "New User ID"]);
    utilities.dataTypeValidation(
      [id, newUserId],
      ["ID", "New user ID"],
      ["string", "string"]
    );

    const lessonModel = utilities.getModel(utilities.LessonSchema, "Lesson");

    const updatedLesson = await lessonModel.findByIdAndUpdate(
      id,
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

export async function removeLesson(id) {
  try {
    utilities.argValidation([id], ["Lesson ID"]);
    utilities.dataTypeValidation([id], ["ID"], ["string"]);

    const lessonModel = utilities.getModel(utilities.LessonSchema, "Lesson");

    const deletedLesson = await lessonModel.findByIdAndDelete(id);
    if (!deletedLesson) throw new Error("Lesson not found or already deleted");

    return {
      success: true,
      message: "Lesson successfully removed",
      lesson: deletedLesson,
    };
  } catch (error) {
    await errorEmail("Failed to remove lesson", error.toString());
    throw error;
  }
}
