/**
 * UTILITY export function S
 *
 * DESCRIPTION: This module contains all utility export function s,
 * organized into:
 *  - Universal export function s
 *  - Mongoose export function s
 *  - Controller export function s
 */

import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// ======== UNIVERSAL PURPOSE ======== //

/**
 * Validates a list of arguments to ensure they are not falsy.
 *
 * @param {Array} args - The list of argument values to validate.
 * @param {Array} argNames - The corresponding argument names for error messages.
 *
 * @throws {Error} - If any argument is missing or falsy, an error is thrown
 *                   with a message like "Username required".
 *
 * @example
 *   argValidation([username, password], ["Username", "Password"]);
 */
export function  argValidation(args, argNames) {
  for (let i = 0; i < args.length; i++) {
    if (!args[i]) throw new Error(`${argNames[i]} required`);
  }
}

// ======== MONGOOSE ======== //

/**
 * Dynamically creates or retrieves a Mongoose model based on a schema definition.
 *
 * @param {Object} schemaDefinition - Mongoose schema definition object.
 * @param {String} modelName - The name of the model to create or fetch.
 *
 * @returns {mongoose.Model} - The Mongoose model instance.
 *
 * @example
 *   const UserModel = getModel(schemas().User, "User");
 */
export function  getModel(schemaDefinition, modelName) {
  if (mongoose.models[modelName]) {
    return mongoose.model(modelName); // Return the existing compiled model
  }
  const schema = new mongoose.Schema(schemaDefinition);
  return /* mongoose.models[modelName] || */ mongoose.model(modelName, schema);
}

/**
 * Returns a collection of schema definitions used throughout the app.
 * This allows for centralized schema logic and easy reuse.
 *
 * @returns {Object} - An object containing schema definitions keyed by model name.
 *
 * @example
 *   const userSchema = schemas().User;
 */
export function  schemas() {
  return {
    User: {
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    },
    Lesson: {
      lessonID: { type: Number, required: true, unique: true },
      type: { type: String, required: true },
      date: { type: Date, required: true },
      timeLength: { type: String, required: true },
      assignedTo: { type: Number, required: true },
    },
  };
}

/**
 * TokenBlacklist class to track blacklisted tokens with expiration,
 * preventing memory leaks by cleaning expired tokens periodically.
 */
export class TokenBlacklist {
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

// ======== CONTROLLERS ======== //

/**
 * Sends a standardized HTTP error response.
 *
 * DESCRIPTION: This helper export function  formats and sends a JSON response
 * with the given HTTP status code, a custom error message, and the
 * error details extracted from the Error object. Useful for consistent
 * error handling across controllers.
 *
 * @param {import("express").Response} res - Express response object used to send the response
 * @param {number} code - HTTP status code to send (e.g., 400, 401, 500)
 * @param {string} message - Custom error message describing the failure
 * @param {Error} error - The error object from which to extract details
 *
 * @returns {void}
 *
 * @example
 *   try {
 *     // some code that throws
 *   } catch (err) {
 *     httpErrorMssg(res, 500, "Internal server error", err);
 *   }
 */
export function  httpErrorMssg(res, code, message, error) {
  res.status(code).json({
    message: message,
    error: error.message || "An unknown error occurred",
  });
}

