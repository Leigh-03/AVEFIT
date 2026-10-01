const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateEmail, normalizeEmail } = require("../utils/security");
const { verifyGoogleToken } = require("../utils/googleAuth");

const createAdminToken = (admin) => {
  return jwt.sign(
    {
      admin_id: admin.admin_id,
      email: admin.email,
      role: admin.role,
      token_version: Number(admin.token_version || 0),
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
};

const publicAdmin = (admin) => ({
  id: admin.admin_id,
  name: admin.full_name,
  email: admin.email,
  role: admin.role,
  photo_url: admin.photo_url,
});

// =========================================================
// NORMAL ADMIN LOGIN
// =========================================================

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      !validateEmail(email) ||
      typeof password !== "string" ||
      password.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email and password.",
      });
    }

    const result = await db.query(
      `SELECT admin_id, full_name, email, password, role,
              photo_url, account_status, token_version, google_id
       FROM admins
       WHERE LOWER(email) = $1`,
      [normalizeEmail(email)]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const admin = result.rows[0];

    if (
      String(admin.account_status || "Active").toLowerCase() !== "active"
    ) {
      return res.status(403).json({
        success: false,
        message: "This admin account is inactive.",
      });
    }

    if (!admin.password) {
      return res.status(401).json({
        success: false,
        message: "Password login is not configured for this admin account.",
      });
    }

    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createAdminToken(admin);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      admin: publicAdmin(admin),
    });
  } catch (error) {
    console.error("loginAdmin error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================================================
// GOOGLE ADMIN LOGIN
// ONLY THE EXISTING ADMIN ACCOUNT CAN USE THIS
// =========================================================

const googleLoginAdmin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google authentication token is required.",
      });
    }

    const google = await verifyGoogleToken(idToken);

    // Find an existing admin using the Google ID.
    let result = await db.query(
      `SELECT admin_id, full_name, email, password, role,
              photo_url, account_status, token_version, google_id
       FROM admins
       WHERE google_id = $1
       LIMIT 1`,
      [google.google_id]
    );

    // If this is the first Google login, allow linking ONLY
    // to an existing admin account with the same verified email.
    if (result.rows.length === 0) {
      result = await db.query(
        `SELECT admin_id, full_name, email, password, role,
                photo_url, account_status, token_version, google_id
         FROM admins
         WHERE LOWER(email) = $1
         LIMIT 1`,
        [google.email]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "This Google account is not authorized as an AveFit administrator.",
        });
      }

      const admin = result.rows[0];

      // Link Google account to the existing admin.
      await db.query(
        `UPDATE admins
         SET google_id = $1,
             updated_at = NOW()
         WHERE admin_id = $2`,
        [google.google_id, admin.admin_id]
      );

      admin.google_id = google.google_id;

      result = {
        rows: [admin],
      };
    }

    const admin = result.rows[0];

    // Extra protection:
    // the Google account must belong to the one existing admin.
    if (admin.google_id !== google.google_id) {
      return res.status(403).json({
        success: false,
        message: "This Google account is not linked to the AveFit administrator.",
      });
    }

    if (
      String(admin.account_status || "Active").toLowerCase() !== "active"
    ) {
      return res.status(403).json({
        success: false,
        message: "This admin account is inactive.",
      });
    }

    const token = createAdminToken(admin);

    return res.json({
      success: true,
      message: "Google login successful.",
      token,
      admin: publicAdmin(admin),
    });
  } catch (error) {
    console.error("googleLoginAdmin error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed.",
    });
  }
};

module.exports = {
  loginAdmin,
  googleLoginAdmin,
};