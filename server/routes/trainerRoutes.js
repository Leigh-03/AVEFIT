const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  getTrainers, getTrainerById, createTrainer, updateTrainer, deactivateTrainer, getTrainerRoster
} = require("../controllers/trainerController");

router.get("/", verifyToken, getTrainers);
router.get("/:id/roster", verifyToken, getTrainerRoster);
router.get("/:id", verifyToken, getTrainerById);
router.post("/", verifyToken, createTrainer);
router.put("/:id", verifyToken, updateTrainer);
router.put("/:id/deactivate", verifyToken, deactivateTrainer);

module.exports = router;