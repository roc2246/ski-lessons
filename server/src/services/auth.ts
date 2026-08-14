import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as utilities from "../utilities/index.js";
import { errorEmail } from "../email/index.js";
import { getJwtSecret } from "../utilities/config.js";
import { BlacklistedTokenSchema, UserSchema } from "../models/schemas.js";

type StatusError = Error & { status?: number };

interface AuthUserDocument {
  _id: { toString(): string };
  username: string;
  password: string;
  admin: boolean;
}

function getBlacklistedTokenModel() {
  return utilities.getModel(BlacklistedTokenSchema, "BlacklistedToken");
}

function createStatusError(message: string, status: number): StatusError {
  const error = new Error(message) as StatusError;
  error.status = status;
  return error;
}

async function getUserModel() {
  return utilities.getModel(UserSchema, "User");
}

/**
 * Seeds or repairs the local development admin account outside production.
 */
export async function ensureLocalAdminUser(
  username: string | undefined = process.env.LOCAL_ADMIN_USERNAME,
  password: string | undefined = process.env.LOCAL_ADMIN_PASSWORD
): Promise<unknown> {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const normalizedUsername = typeof username === "string" ? username.trim() : username;
  const normalizedPassword = typeof password === "string" ? password.trim() : password;

  if (!normalizedUsername || !normalizedPassword) {
    console.warn(
      "[auth] Skipping local admin bootstrap: set LOCAL_ADMIN_USERNAME and LOCAL_ADMIN_PASSWORD in server/config/.env"
    );
    return null;
  }

  const User = await getUserModel();
  const existing = await User.findOne({ username: normalizedUsername }).lean();

  if (existing) {
    if ((existing as AuthUserDocument).admin === true) {
      return existing;
    }

    return User.findOneAndUpdate(
      { username: normalizedUsername },
      { $set: { admin: true } },
      { returnDocument: "after" }
    ).lean();
  }

  const hashedPassword = await bcrypt.hash(normalizedPassword, 12);
  const seededUser = new User({
    username: normalizedUsername,
    password: hashedPassword,
    admin: true,
  });

  await seededUser.save();
  return seededUser.toObject();
}

export async function newUser(username: string, password: string, admin: boolean): Promise<void> {
  try {
    const User = utilities.getModel(UserSchema, "User");

    const existing = await User.findOne({ username }).lean();
    if (existing) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      password: hashedPassword,
      admin,
    });

    await newUser.save();
  } catch (error) {
    await errorEmail("Failed to register user", error instanceof Error ? error.toString() : String(error));
    throw error;
  }
}

/**
 * Authenticates a user and returns a 1-hour JWT with user identity and admin claims.
 */
export async function loginUser(username: string, password: string): Promise<string> {
  try {
    const User = utilities.getModel(UserSchema, "User");

    const userCreds = await User.findOne({ username });
    if (!userCreds) throw new Error("User or password doesn't match");

    const passwordMatch = await bcrypt.compare(password, (userCreds as AuthUserDocument).password);
    if (!passwordMatch) throw new Error("User or password doesn't match");

    return jwt.sign(
      {
        userId: (userCreds as AuthUserDocument)._id.toString(),
        username: (userCreds as AuthUserDocument).username,
        admin: (userCreds as AuthUserDocument).admin,
      },
      getJwtSecret(),
      { expiresIn: "1h" }
    );
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(username: string): Promise<unknown> {
  try {
    const User = utilities.getModel(UserSchema, "User");

    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser) throw new Error(`No user found with username: ${username}`);

    return deletedUser;
  } catch (error) {
    throw error;
  }
}

export async function getUser(id: string): Promise<unknown> {
  try {
    const User = utilities.getModel(UserSchema, "User");
    const user = await User.findById(id).lean();
    if (!user) throw new Error(`No user found with ID: ${id}`);
    return user;
  } catch (error) {
    throw error;
  }
}

export async function getUsers(userId?: string): Promise<unknown[]> {
  try {
    const User = utilities.getModel(UserSchema, "User");
    const query = typeof userId === "string" ? { _id: { $ne: userId } } : {};
    return await User.find(query).select("-password").lean();
  } catch (error) {
    throw error;
  }
}

/**
 * Revokes the current token by upserting it into the blacklist until expiration.
 */
export async function logoutUser(token: string): Promise<void> {
  try {
    if (typeof jwt.decode !== "function") {
      throw createStatusError("Invalid token: unable to decode", 401);
    }

    const decoded = jwt.decode(token);
    const expiresAt = typeof decoded === "object" && decoded !== null && "exp" in decoded && typeof decoded.exp === "number"
      ? decoded.exp
      : null;

    if (!expiresAt) {
      throw createStatusError("Invalid token: missing expiration", 401);
    }

    const BlacklistedToken = getBlacklistedTokenModel();
    await BlacklistedToken.updateOne(
      { token },
      { token, expiresAt: new Date(expiresAt * 1000) },
      { upsert: true }
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Checks whether a token has been revoked and persisted in the blacklist collection.
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const BlacklistedToken = getBlacklistedTokenModel();
    const found = await BlacklistedToken.exists({ token });
    return Boolean(found);
  } catch (error) {
    await errorEmail("Token blacklist lookup failed", error instanceof Error ? error.toString() : String(error));
    throw createStatusError("Token blacklist lookup failed", 503);
  }
}
