import mongoose from "mongoose";
import { errorEmail } from "../email";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const path = require("path");
const errorEmail = require("../email");

require("dotenv").config({
  path: path.join(__dirname, "../config/.env"),
});

async function dbConnect() {
  try {
    const db = { dbName: "ski-lessons" };
    await mongoose.connect(process.env.URI, db);
  } catch (error) {
    console.log(error);
    await errorEmail("Connection Failed", error.toString());
    throw error;
  }
}

async function newUser(username, password) {
  try {
    // INPUT VALIDATION
    if (!username) throw new Error("Username required");
    if (!password) throw new Error("Password required");

    // CONNECT
    await dbConnect();

    // CREATE SCHEMA AND MODEL
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    });
    const UserModel = /*  mongoose.models.User || */ mongoose.model(
      "User",
      userSchema
    );

    // CHECK IF USER IS IN DB
    const userInDB = await UserModel.find({ username });
    if (userInDB.length > 0) throw new Error("User already exists");

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 12);

    // CREATE NEW USER
    const newUser = new UserModel({ username, password: hashedPassword });
    await newUser.save();
    console.log("User successfully created");
  } catch (error) {
    console.error("Error creating user:", error);
    await errorEmail("Failed to register user", error.toString());
    throw error;
  } finally {
    mongoose.disconnect();
  }
}

async function loginUser(username, password) {
  try {
    // INPUT VALIDATION
    if (!username) throw new Error("Username required");
    if (!password) throw new Error("Password required");

    await dbConnect();

    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    });
    const UserModel = mongoose.model("User", userSchema);

    const userCreds = await UserModel.find({ username });
    if (userCreds.length === 0)
      throw new Error("User or password doesn't match");

    const hashedPassword = await bcrypt.hash(password, 12);
    const noPassword = "User or passowrd doesnt match";
    if (userCreds[0].password !== hashedPassword) throw new Error(noPassword);

    const token = jwt.sign(
      { username: userCreds.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return token;
  } catch (error) {
    throw error;
  } finally {
    mongoose.disconnect();
  }
}

module.exports = {
  dbConnect,
  newUser,
  loginUser,
};
