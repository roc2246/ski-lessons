import mongoose from "mongoose";
import { errorEmail } from "../email";
const { Schema } = mongoose;

const bcrypt = require("bcrypt");
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
    await dbConnect();

    const userSchema = new Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    });

    const UserModel =
      mongoose.models.User || mongoose.model("User", userSchema);

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new UserModel({ username, password: hashedPassword });

    await newUser.save();

    console.log("User successfully created");
  } catch (error) {
    console.error("Error creating user:", error);
    await errorEmail("Failed to register user", error.toString());
    throw error;
  }
}

module.exports = {
  dbConnect,
  newUser,
};
