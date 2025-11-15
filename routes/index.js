import express from "express";
import * as controllers from "../controllers/index.js"; // include .js extension

const router = express.Router();

// Define routes
router.post("/register", controllers.manageNewUser);
router.post("/login", controllers.manageLogin);
router.post("/logout", controllers.manageLogout);
router.delete("/self-delete", controllers.selfDeleteAccount);
router.get("/lessons", controllers.manageLessonRetrieval);
router.post("/create-lesson", controllers.manageCreateLesson);
router.patch("/lessons/:lessonId/assign", controllers.manageSwitchLessonAssignment);
router.get("/is-admin", controllers.decodeUser);


export default router;
