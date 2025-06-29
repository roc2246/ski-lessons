const { mongoose, Schema } = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
const errorEmail = require("../email");

require("dotenv").config({
  path: path.join(__dirname, "../config/.env"),
});

async function connect(uri = process.env.URI) {
  try {
    if (!uri) throw new Error("MongoDB connection URI is required");
    const db = { dbName: "ski-lessons" };
    const connection = await mongoose.connect(uri, db);
    return connection;
  } catch (error) {
    console.log(error);
    await errorEmail("Connection Failed", error.toString());
    throw error;
  }
}

async function newUser(username, password) {
  try {
    await connect();

    // Define schema
    const userSchema = new Schema({
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    });

    // Prevent model overwrite errors in dev
    const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user document
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
  connect,
  newUser,
};
