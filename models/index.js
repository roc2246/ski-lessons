const mongoose = require('mongoose');
const path = require("path");
require('dotenv').config({
  path: path.join(__dirname, "../config/.env"),
})

async function connect(uri = process.env.URI) {
    try {
        await mongoose.connect(uri)
    } catch (error) {
        console.log(error)
        throw error
    }
}

module.exports = {
    connect
}