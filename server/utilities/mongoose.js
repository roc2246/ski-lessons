import mongoose from "mongoose";

/**
 * Returns a compiled Mongoose model or creates it if it doesn't exist.
 *
 * @param {mongoose.Schema} schema - Schema definition
 * @param {string} modelName - Model name
 * @returns {mongoose.Model} - Compiled model
 */
export function getModel(schema, modelName) {
  return mongoose.models[modelName] || mongoose.model(modelName, schema);
}
