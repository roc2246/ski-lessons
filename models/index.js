const { mongoose, Schema } = require("mongoose");
const path = require("path");
const errorEmail = require("../email");

require("dotenv").config({
  path: path.join(__dirname, "../config/.env"),
});

async function connect(uri = process.env.URI) {
  try {
    if (!uri) throw new Error("MongoDB connection URI is required");
    const connection = await mongoose.connect(uri, {
      dbName: "myDatabaseName",
    });
    return connection;
  } catch (error) {
    console.log(error);
    await errorEmail("Connection Failed", error.toString());
    throw error;
  }
}

async function newUser(username, password) {
  try {
    // Connect to DB (use env var or replace with your connection string)
    await connect()
    // Check if model is already compiled to prevent OverwriteModelError
    const User =
      mongoose.models.User ||
      mongoose.model(
        "User",
        new mongoose.Schema({
          username: { type: String, required: true, unique: true },
          password: { type: String, required: true },
        })
      );

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 12); // 12 salt rounds is standard

    // Create and save the new user
    const newUser = new User({ username, password: hashedPassword });
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
