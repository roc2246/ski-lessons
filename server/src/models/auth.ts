import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as utilities from "../utilities/index.js";
import { errorEmail } from "../email/index.js";

interface AuthUserDocument {
  _id: { toString(): string };
  username: string;
  password: string;
  admin: boolean;
  lean?: () => Promise<unknown>;
}

function getBlacklistedTokenModel() {
  return utilities.getModel(utilities.BlacklistedTokenSchema, "BlacklistedToken");
}

async function getUserModel() {
  return utilities.getModel(utilities.UserSchema, "User");
}

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

  if (typeof normalizedUsername !== "string" || typeof normalizedPassword !== "string") {
    throw new Error("Username and password must be strings");
  }

  const User = await getUserModel();
  const existing = await User.findOne({ username: normalizedUsername }).lean();

  if (existing) {
    if (existing.admin === true) {
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

export async function newUser(username: string, password: string, admin: boolean) {
  try {
    if (typeof username !== "string" || typeof password !== "string" || typeof admin !== "boolean") {
      throw new Error("Username, password, and admin must be provided with the correct types");
    }

    const User = utilities.getModel(utilities.UserSchema, "User");

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

export async function loginUser(username: string, password: string) {
  try {
    if (typeof username !== "string" || typeof password !== "string") {
      throw new Error("Username and password must be strings");
    }

    const User = utilities.getModel(utilities.UserSchema, "User");

    const userCreds = await User.findOne({ username });
    if (!userCreds) throw new Error("User or password doesn't match");

    const passwordMatch = await bcrypt.compare(password, userCreds.password);
    if (!passwordMatch) throw new Error("User or password doesn't match");

    return jwt.sign(
      {
        userId: userCreds._id.toString(),
        username: userCreds.username,
        admin: userCreds.admin,
      },
      process.env.JWT_SECRET ?? "development-secret",
      { expiresIn: "1h" }
    );
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(username: string) {
  try {
    if (typeof username !== "string") {
      throw new Error("Username must be a string");
    }

    const User = utilities.getModel(utilities.UserSchema, "User");

    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser) throw new Error(`No user found with username: ${username}`);

    return deletedUser;
  } catch (error) {
    throw error;
  }
}

export async function getUser(id: string) {
  try {
    if (typeof id !== "string") {
      throw new Error("User ID must be a string");
    }

    const User = utilities.getModel(utilities.UserSchema, "User");
    const user = await User.findById(id).lean();
    if (!user) throw new Error(`No user found with ID: ${id}`);
    return user;
  } catch (error) {
    throw error;
  }
}

export async function getUsers(userId?: string) {
  try {
    const User = utilities.getModel(utilities.UserSchema, "User");
    const query = typeof userId === "string" ? { _id: { $ne: userId } } : {};
    return await User.find(query).select("-password").lean();
  } catch (error) {
    throw error;
  }
}

export async function logoutUser(token: string) {
  try {
    if (typeof token !== "string") {
      throw new Error("Token must be a string");
    }

    if (typeof jwt.decode !== "function") {
      throw new Error("Invalid token: unable to decode");
    }

    const decoded = jwt.decode(token);
    const expiresAt = typeof decoded === "object" && decoded !== null && "exp" in decoded && typeof decoded.exp === "number"
      ? decoded.exp
      : null;

    if (!expiresAt) {
      throw new Error("Invalid token: missing expiration");
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

export async function isTokenBlacklisted(token: string) {
  if (typeof token !== "string") {
    throw new Error("Token must be a string");
  }

  const BlacklistedToken = getBlacklistedTokenModel();
  const found = await BlacklistedToken.exists({ token });
  return Boolean(found);
}
