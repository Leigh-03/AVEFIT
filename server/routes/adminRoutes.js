const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { loginAdmin } = require("../controllers/adminController");

router.post("/login", loginAdmin);

module.exports = router;