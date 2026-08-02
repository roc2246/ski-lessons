import mongoose from "mongoose";

export interface LessonDocument {
  type: string;
  date: string;
  timeLength: string;
  guests: number;
  assignedTo?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDocument {
  username: string;
  password: string;
  admin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlacklistedTokenDocument {
  token: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const LessonSchema = new mongoose.Schema<LessonDocument>(
  {
    type: { type: String, required: true },
    date: { type: String, required: true },
    timeLength: { type: String, required: true },
    guests: { type: Number, required: true },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export const UserSchema = new mongoose.Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const BlacklistedTokenSchema = new mongoose.Schema<BlacklistedTokenDocument>(
  {
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

LessonSchema.index({ date: 1 });
LessonSchema.index({ assignedTo: 1 });
LessonSchema.index(
  { date: 1, assignedTo: 1 },
  { unique: true, partialFilterExpression: { assignedTo: { $type: "objectId" } } }
);
