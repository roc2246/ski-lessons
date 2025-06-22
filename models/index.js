const mongoose = require('mongoose');
const path = require("path");
const errorEmail = require("../email")

require('dotenv').config({
  path: path.join(__dirname, "../config/.env"),
})

async function connect(uri = process.env.URI) {
  try {
    if (!uri) throw new Error("MongoDB connection URI is required");
    const db = ""
    const connection = await mongoose.connect(`${uri}/\/${db}`);
    return connection; 
  } catch (error) {
    console.log(error);
    await errorEmail("Connection Failed", error.toString());
    throw error;
  }
}


module.exports = {
    connect
}