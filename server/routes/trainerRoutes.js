const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const verifyTrainer = require("../middleware/trainerAuthMiddleware");

const {
  getTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  approveTrainer,
  rejectTrainer,
  deactivateTrainer,
  getTrainerRoster,

  loginTrainer,
  googleLoginTrainer,

  getMyRoster,
  getMyProfile,
  updateMyPhoto,
  getExerciseCatalog,
  getRosterMemberSessions,
  assignSessionAsTrainer,
  deleteSessionAsTrainer,
} = require("../controllers/trainerController");

const { userLoginLimiter } = require("../middleware/rateLimit");

// =========================================================
// TRAINER LOGIN
// =========================================================

router.post("/login", userLoginLimiter, loginTrainer);

router.post("/google-login", googleLoginTrainer);

// =========================================================
// TRAINER PORTAL
// =========================================================

router.get("/me/roster", verifyTrainer, getMyRoster);

router.get("/me/profile", verifyTrainer, getMyProfile);

router.put("/me/photo", verifyTrainer, updateMyPhoto);

router.get("/me/exercises", verifyTrainer, getExerciseCatalog);

router.get(
  "/me/members/:userId/sessions",
  verifyTrainer,
  getRosterMemberSessions
);

router.post(
  "/me/assign",
  verifyTrainer,
  assignSessionAsTrainer
);

router.delete(
  "/me/sessions/:sessionId",
  verifyTrainer,
  deleteSessionAsTrainer
);

// =========================================================
// ADMIN-MANAGED TRAINERS
// =========================================================

router.get("/", verifyToken, getTrainers);

router.get("/:id/roster", verifyToken, getTrainerRoster);

router.get("/:id", verifyToken, getTrainerById);

router.post("/", verifyToken, createTrainer);

router.put("/:id", verifyToken, updateTrainer);

router.put("/:id/approve", verifyToken, approveTrainer);

router.put("/:id/reject", verifyToken, rejectTrainer);

router.put("/:id/deactivate", verifyToken, deactivateTrainer);

module.exports = router;