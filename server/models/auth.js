import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as utilities from "../utilities/index.js";
import { errorEmail } from "../email/index.js";

function getBlacklistedTokenModel() {
  return utilities.getModel(utilities.BlacklistedTokenSchema, "BlacklistedToken");
}

async function getUserModel() {
  return utilities.getModel(utilities.UserSchema, "User");
}

export async function ensureLocalAdminUser(
  username = process.env.LOCAL_ADMIN_USERNAME || "roc09090",
  password = process.env.LOCAL_ADMIN_PASSWORD || "Roc*0283"
) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  utilities.argValidation([username, password], ["Username", "Password"]);

  const User = await getUserModel();
  const existing = await User.findOne({ username }).lean();

  if (existing) {
    if (existing.admin === true) {
      return existing;
    }

    return User.findOneAndUpdate(
      { username },
      { $set: { admin: true } },
      { new: true }
    ).lean();
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const seededUser = new User({
    username,
    password: hashedPassword,
    admin: true,
  });

  await seededUser.save();
  return seededUser.toObject();
}

// ---------- REGISTER ----------
export async function newUser(username, password, admin) {
  try {
    utilities.argValidation(
      [username, password, admin],
      ["Username", "Password", "Admin"]
    );

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
    await errorEmail("Failed to register user", error.toString());
    throw error;
  }
}

// ---------- LOGIN ----------
export async function loginUser(username, password) {
  try {
    utilities.argValidation([username, password], ["Username", "Password"]);

    const User = utilities.getModel(utilities.UserSchema, "User");

    const userCreds = await User.findOne({ username });
    if (!userCreds)
      throw new Error("User or password doesn't match");

    const passwordMatch = await bcrypt.compare(password, userCreds.password);
    if (!passwordMatch) throw new Error("User or password doesn't match");

    return jwt.sign(
      {
        userId: userCreds._id.toString(),
        username: userCreds.username,
        admin: userCreds.admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (error) {
    throw error;
  }
}

// ---------- DELETE USER ----------
export async function deleteUser(username) {
  try {
    utilities.argValidation([username], ["Username"]);

    const User = utilities.getModel(utilities.UserSchema, "User");

    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser)
      throw new Error(`No user found with username: ${username}`);

    return deletedUser;
  } catch (error) {
    throw error;
  }
}

// ---------- LOGOUT ----------
export async function logoutUser(token) {
  try {
    utilities.argValidation([token], ["Token"]);

    if (typeof jwt.decode !== "function") {
      throw new Error("Invalid token: unable to decode");
    }

    const decoded = jwt.decode(token);
    if (!decoded?.exp) {
      throw new Error("Invalid token: missing expiration");
    }

    const BlacklistedToken = getBlacklistedTokenModel();
    await BlacklistedToken.updateOne(
      { token },
      { token, expiresAt: new Date(decoded.exp * 1000) },
      { upsert: true }
    );
  } catch (error) {
    throw error;
  }
}

export async function isTokenBlacklisted(token) {
  utilities.argValidation([token], ["Token"]);
  const BlacklistedToken = getBlacklistedTokenModel();
  const found = await BlacklistedToken.exists({ token });
  return Boolean(found);
}
