/**
 * UTILITY FUNCTIONS
 *
 * DESCRIPTION: This module contains all utility functions,
 * organized into:
 *  - Universal functions
 *  -Mongoose functions
 */

import mongoose from "mongoose";

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
function argValidation(args, argNames) {
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
function getModel(schemaDefinition, modelName) {
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
function schemas() {
  return {
    User: {
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    },
  };
}

module.exports = {
  argValidation,
  getModel,
  schemas,
};