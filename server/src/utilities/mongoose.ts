import mongoose from "mongoose";

/**
 * Returns a compiled Mongoose model or creates it if it doesn't exist.
 */
export function getModel<T>(schema: mongoose.Schema<T>, modelName: string): mongoose.Model<T> {
  const models = mongoose.models as Record<string, mongoose.Model<T> | undefined>;
  return models[modelName] ?? mongoose.model<T>(modelName, schema);
}
