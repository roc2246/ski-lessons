import mongoose from "mongoose";

/**
 * Centralized Mongoose schemas
 */
export const LessonSchema = new mongoose.Schema({
  type: { type: String, required: true },
  date: { type: String, required: true },
  timeLength: { type: String, required: true },
  guests: { type: Number, required: true },
  assignedTo: { type: String, required: true, ref: "User" },
});

LessonSchema.index({ date: 1, assignedTo: 1 }, { unique: true });

export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: { type: Boolean, required: true },
});
