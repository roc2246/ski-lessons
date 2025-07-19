const express = require("express");
const controllers = require("./controllers"); // Adjust path as needed

const router = express.Router();

// Middleware to parse JSON bodies on this router (optional if globally used)
router.use(express.json());

// Define routes
router.post("/register", controllers.manageNewUser);
router.post("/login", controllers.manageLogin);
router.post("/logout", controllers.manageLogout);
router.get("/lessons", controllers.manageLessonRetrieval);

module.exports = router;
