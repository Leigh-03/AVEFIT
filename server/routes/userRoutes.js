const express = require("express");
const router = express.Router();
const verifyUser = require("../middleware/userAuthMiddleware");
const { register, login, getProfile, updateProfile, updatePhoto } = require("../controllers/userController");
const { getUserWorkoutPlan, getUserPlans, addWorkoutSession, updateWorkoutSession, completeSession, deleteWorkoutSession, resetWeek } = require("../controllers/userWorkoutController");
const { getProgress, logProgress, calculatePrediction, autoPredict, getUserNotifications } = require("../controllers/userProgressController");
const { getActiveTrainers } = require("../controllers/trainerController");

// Auth
router.post("/register", register);
router.post("/login", login);

// Profile
router.get("/profile", verifyUser, getProfile);
router.put("/profile", verifyUser, updateProfile);
router.put("/profile/photo", verifyUser, updatePhoto);

// Workouts
router.get("/workouts", verifyUser, getUserWorkoutPlan);
router.get("/plans", verifyUser, getUserPlans);
router.post("/workouts", verifyUser, addWorkoutSession);
router.put("/workouts/:id", verifyUser, updateWorkoutSession);
router.put("/workouts/:id/complete", verifyUser, completeSession);
router.delete("/workouts/:id", verifyUser, deleteWorkoutSession);
router.delete("/workouts/reset/week", verifyUser, resetWeek);

// Progress
router.get("/progress", verifyUser, getProgress);
router.post("/progress", verifyUser, logProgress);
router.post("/progress/predict", verifyUser, calculatePrediction);
router.post("/progress/auto-predict", verifyUser, autoPredict);

// Coaches (member-facing)
router.get("/trainers", getActiveTrainers);

// Notifications
router.get("/notifications", verifyUser, getUserNotifications);

module.exports = router;