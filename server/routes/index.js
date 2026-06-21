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

// Public routes (no authentication required)
router.post("/register", validateRegisterRequest, controllers.manageNewUser);
router.post("/login", validateLoginRequest, controllers.manageLogin);

// Protected routes (require authentication)
router.post("/logout", authenticate, controllers.manageLogout);
router.delete("/self-delete", authenticate, controllers.selfDeleteAccount);
router.get("/is-admin", authenticate, controllers.decodeUser);

// Lesson routes (authenticated)
router.get("/lessons", authenticate, controllers.manageLessonRetrieval);
router.post("/create-lesson", authenticate, validateCreateLessonRequest, controllers.manageCreateLesson);
router.patch("/lessons/:lessonId/assign", authenticate, validateAssignLessonRequest, controllers.manageSwitchLessonAssignment);

// Admin-only routes (require authentication + admin role)
router.get("/user-retrieval", authenticate, requireAdmin, controllers.manageUserRetrieval);

export default router;
