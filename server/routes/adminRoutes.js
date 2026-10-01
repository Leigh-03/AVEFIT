const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/adminAuthMiddleware");
const { adminLoginLimiter } = require("../middleware/rateLimit");

const {
  loginAdmin,
  googleLoginAdmin,
} = require("../controllers/adminController");

// Normal email/password login
router.post("/login", adminLoginLimiter, loginAdmin);

// Google login
router.post("/google-login", googleLoginAdmin);

module.exports = router;