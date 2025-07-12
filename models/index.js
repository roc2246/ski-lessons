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
    throw error;
  } finally {
    mongoose.disconnect();
  }
}

/**
 * TokenBlacklist class to track blacklisted tokens with expiration,
 * preventing memory leaks by cleaning expired tokens periodically.
 */
class TokenBlacklist {
  constructor() {
    this.tokens = new Map(); // token string => expiration timestamp (ms)
    this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000); // cleanup every 10 minutes
  }

  /**
   * Add a token to the blacklist with its expiration time.
   * @param {string} token JWT token string
   */
  add(token) {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      throw new Error("Invalid token: cannot decode expiration");
    }
    const expiresAt = decoded.exp * 1000; // exp is in seconds, convert to ms
    this.tokens.set(token, expiresAt);
  }

  /**
   * Check if a token is blacklisted and still valid.
   * Automatically removes expired tokens.
   * @param {string} token JWT token string
   * @returns {boolean} true if blacklisted and valid, false otherwise
   */
  has(token) {
    const expiresAt = this.tokens.get(token);
    if (!expiresAt) return false;

    if (Date.now() > expiresAt) {
      this.tokens.delete(token);
      return false;
    }
    return true;
  }

  /**
   * Remove expired tokens from the blacklist.
   */
  cleanup() {
    const now = Date.now();
    for (const [token, expiresAt] of this.tokens.entries()) {
      if (expiresAt < now) {
        this.tokens.delete(token);
      }
    }
  }

  /**
   * Call to stop the cleanup interval when no longer needed.
   */
  stop() {
    clearInterval(this.cleanupInterval);
  }
}

// Export a factory to create new blacklist instances
function createTokenBlacklist() {
  return new TokenBlacklist();
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

// ======== EXPORTS ======== //
module.exports = {
  dbConnect,
  newUser,
  loginUser,
  logoutUser,
  createTokenBlacklist,
};
