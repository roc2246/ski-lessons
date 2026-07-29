import mongoose from "mongoose";

/**
 * Returns a compiled Mongoose model or creates it if it doesn't exist.
 */
export function getModel(schema: mongoose.Schema, modelName: string): mongoose.Model<any> {
  const models = mongoose.models as Record<string, mongoose.Model<any>>;
  return models[modelName] || mongoose.model(modelName, schema);
}
