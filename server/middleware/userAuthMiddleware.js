const jwt = require("jsonwebtoken");
const pool = require("../db");

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ success: false, message: "Access denied. No token." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.user_id) return res.status(403).json({ success: false, message: "Invalid user token." });

    const result = await pool.query(
      "SELECT user_id, account_status, token_version FROM users WHERE user_id = $1",
      [decoded.user_id]
    );
    if (result.rows.length === 0) return res.status(401).json({ success: false, message: "User account not found." });

    const status = result.rows[0].account_status;
    if (Number(decoded.token_version ?? -1) !== Number(result.rows[0].token_version ?? 0)) {
      return res.status(401).json({ success: false, message: "Your session is no longer valid. Please log in again." });
    }
    if (status !== "Active") {
      return res.status(403).json({
        success: false,
        status: status || "Pending",
        message: status === "Rejected"
          ? "Your AveFit account was not approved. Please contact the gym administrator."
          : "Your account is still pending approval. Please wait 1-3 working days while the gym administrator reviews your registration."
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = verifyUser;
