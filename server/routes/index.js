import express from "express";
import * as controllers from "../controllers/index.js";
import {
	authenticate,
	requireAdmin,
	validateRegisterRequest,
	validateLoginRequest,
	validateCreateLessonRequest,
	validateAssignLessonRequest,
} from "../middleware/index.js";

const router = express.Router();

// Auth routes (public)
router.post("/auth/register", validateRegisterRequest, controllers.manageNewUser);
router.post("/auth/login",    validateLoginRequest,    controllers.manageLogin);
router.post("/auth/logout",   authenticate,            controllers.manageLogout);

// Current user routes
router.get("/users/me",    authenticate, controllers.decodeUser);
router.delete("/users/me", authenticate, controllers.selfDeleteAccount);

// Lesson routes
router.get("/lessons",              authenticate,                                            controllers.manageLessonRetrieval);
router.post("/lessons",             authenticate, requireAdmin, validateCreateLessonRequest, controllers.manageCreateLesson);
router.patch("/lessons/:lessonId",  authenticate, validateAssignLessonRequest,               controllers.manageSwitchLessonAssignment);
router.delete("/lessons/:lessonId", authenticate, requireAdmin,                              controllers.manageRemoveLesson);

// Admin routes
router.get("/users", authenticate, requireAdmin, controllers.manageUserRetrieval);

export default router;
