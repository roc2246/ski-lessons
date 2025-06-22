const mongoose = require('mongoose');
const path = require("path");
const errorEmail = require("../email")

require('dotenv').config({
  path: path.join(__dirname, "../config/.env"),
})

async function connect(uri = process.env.URI) {
    try {
        await mongoose.connect(uri)
    } catch (error) {
        console.log(error)
        errorEmail("Connection Failed", error.toString())
        throw error
    }
}

module.exports = {
    connect
}