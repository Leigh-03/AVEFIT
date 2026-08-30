const jwt = require("jsonwebtoken");

const verifyTrainer = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ success: false, message: "Access denied. No token." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.trainer_id) {
      return res.status(403).json({ success: false, message: "Invalid trainer token." });
    }
    req.trainer = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = verifyTrainer;
