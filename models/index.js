const mongoose = require('mongoose');
const path = require("path");
const errorEmail = require("../email")

require('dotenv').config({
  path: path.join(__dirname, "../config/.env"),
})

async function connect(uri = process.env.URI) {
  try {
    const connection = await mongoose.connect(uri);
    return connection; // return the connection object
  } catch (error) {
    console.log(error);
    await errorEmail("Connection Failed", error.toString());
    throw error;
  }
}


module.exports = {
    connect
}