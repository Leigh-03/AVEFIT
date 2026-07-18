const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { getProfile, updateProfile, updatePassword } = require("../controllers/settingsController");

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/password", verifyToken, updatePassword);

module.exports = router;