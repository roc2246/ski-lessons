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

    const UserModel = utilities.getModel({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    }, "User");

    const userInDB = await UserModel.find({ username });
    if (userInDB.length > 0) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new UserModel({ username, password: hashedPassword });
    await newUser.save();

    console.log("User successfully created");
  } catch (error) {
    console.error("Error creating user:", error);
    await errorEmail("Failed to register user", error.toString());
    throw error;
  } finally {
    mongoose.disconnect();
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

    const UserModel = utilities.getModel({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    }, "User");

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
    throw error;
  } finally {
    mongoose.disconnect();
  }
}

/**
 * Logs out a user by blacklisting their token.
 * NOTE: This version assumes you'll implement token blacklist checking in your auth middleware.
 * @param {string} token - JWT to invalidate
 */
const tokenBlacklist = new Set();

async function logoutUser(token) {
  try {
    if (!token) throw new Error("Token is required to logout.");
    tokenBlacklist.add(token);
  } catch (error) {
    throw error;
  } finally {
    mongoose.disconnect();
  }
}

/**
 * Check if a token is blacklisted
 * (For use in middleware to simulate token "deletion")
 */
function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

// ======== EXPORTS ======== //
module.exports = {
  dbConnect,
  newUser,
  loginUser,
  logoutUser,
  isTokenBlacklisted,
};
