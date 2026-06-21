import mongoose from "mongoose";

/**
 * Centralized Mongoose schemas
 */
export const LessonSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    date: { type: Date, required: true }, // UTC Date for proper timezone handling
    timeLength: { type: String, required: true },
    guests: { type: Number, required: true },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null instead of "None" string
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

export const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const BlacklistedTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

// Add indexes for performance on frequently queried fields
LessonSchema.index({ date: 1 });
LessonSchema.index({ assignedTo: 1 });
LessonSchema.index({ date: 1, assignedTo: 1 }); // Compound index for filtering
