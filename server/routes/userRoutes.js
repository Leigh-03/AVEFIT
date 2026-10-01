const express = require("express");
const router = express.Router();

const verifyUser = require("../middleware/userAuthMiddleware");

const {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  updatePhoto,
} = require("../controllers/userController");

const {
  getUserWorkoutPlan,
  getUserPlans,
  addWorkoutSession,
  updateWorkoutSession,
  completeSession,
  deleteWorkoutSession,
  resetWeek,
} = require("../controllers/userWorkoutController");

const {
  getProgress,
  logProgress,
  calculatePrediction,
  autoPredict,
  getUserNotifications,
} = require("../controllers/userProgressController");

const { getActiveTrainers } = require("../controllers/trainerController");

const {
  userLoginLimiter,
  signupLimiter,
} = require("../middleware/rateLimit");

// =========================================================
// AUTH
// =========================================================

router.post("/register", signupLimiter, register);

router.post("/login", userLoginLimiter, login);

router.post("/google-login", googleLogin);

// =========================================================
// PROFILE
// =========================================================

router.get("/profile", verifyUser, getProfile);

router.put("/profile", verifyUser, updateProfile);

router.put("/profile/photo", verifyUser, updatePhoto);

// =========================================================
// WORKOUTS
// =========================================================

router.get("/workouts", verifyUser, getUserWorkoutPlan);

router.get("/plans", verifyUser, getUserPlans);

router.post("/workouts", verifyUser, addWorkoutSession);

router.put("/workouts/:id", verifyUser, updateWorkoutSession);

router.put("/workouts/:id/complete", verifyUser, completeSession);

router.delete("/workouts/:id", verifyUser, deleteWorkoutSession);

router.delete("/workouts/reset/week", verifyUser, resetWeek);

// =========================================================
// PROGRESS
// =========================================================

router.get("/progress", verifyUser, getProgress);

router.post("/progress", verifyUser, logProgress);

router.post("/progress/predict", verifyUser, calculatePrediction);

router.post("/progress/auto-predict", verifyUser, autoPredict);

// =========================================================
// COACHES
// =========================================================

router.get("/trainers", getActiveTrainers);

// =========================================================
// NOTIFICATIONS
// =========================================================

router.get("/notifications", verifyUser, getUserNotifications);

module.exports = router;