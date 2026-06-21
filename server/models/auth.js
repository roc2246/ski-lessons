import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as utilities from "../utilities/index.js";
import { dbConnect } from "./db.js";
import { errorEmail } from "../email/index.js";

function getBlacklistedTokenModel() {
  return utilities.getModel(utilities.BlacklistedTokenSchema, "BlacklistedToken");
}

export function createTokenBlacklist() {
  return new utilities.TokenBlacklist();
}

// ---------- REGISTER ----------
export async function newUser(username, password, admin) {
  try {
    utilities.argValidation(
      [username, password, admin],
      ["Username", "Password", "Admin"]
    );

    const User = utilities.getModel(utilities.UserSchema, "User");

    const userInDB = await User.find({ username });
    if (userInDB.length > 0) throw new Error("User already exists");

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

    await dbConnect();
    const userCreds = await User.find({ username });
    if (userCreds.length === 0)
      throw new Error("User or password doesn't match");

    const passwordMatch = await bcrypt.compare(password, userCreds[0].password);
    if (!passwordMatch) throw new Error("User or password doesn't match");

    return jwt.sign(
      {
        userId: userCreds[0]._id.toString(),
        username: userCreds[0].username,
        admin: userCreds[0].admin,
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
export async function logoutUser(tokenOrBlacklist, maybeToken) {
  try {
    const token = typeof maybeToken === "string" ? maybeToken : tokenOrBlacklist;
    const blacklist = typeof maybeToken === "string" ? tokenOrBlacklist : null;
    const legacyMode = Boolean(blacklist?.add);

    utilities.argValidation([token], ["Token"]);

    if (blacklist?.add) {
      blacklist.add(token);
    }

    if (typeof jwt.decode !== "function") {
      if (legacyMode) return;
      throw new Error("Invalid token: unable to decode");
    }

    const decoded = jwt.decode(token);
    if (!decoded?.exp) {
      if (legacyMode) return;
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
