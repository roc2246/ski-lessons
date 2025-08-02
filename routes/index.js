import express from "express";
import * as controllers from "../controllers/index.js"; // include .js extension

const router = express.Router();

// Define routes
router.post("/register", controllers.manageNewUser);
router.post("/login", controllers.manageLogin);
router.post("/logout", controllers.manageLogout);
router.get("/lessons", controllers.manageLessonRetrieval);
router.patch("/lessons/:lessonId/assign", controllers.manageSwitchLessonAssignment);


export default router;
