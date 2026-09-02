const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST register
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;
    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required." });

    const existing = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(`
      INSERT INTO users (first_name, last_name, email, password, phone)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING user_id, first_name, last_name, email, phone, fitness_goal, height, weight, gender, activity_level, setup_completed
    `, [first_name, last_name, email, hashed, phone || null]);

    const user = result.rows[0];

    // Auto-login: hand back a token right away so the person doesn't have to log in twice.
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(201).json({ success: true, message: "Account created.", token, user });
  } catch (err) {
    console.error("register error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        fitness_goal: user.fitness_goal,
        height: user.height,
        weight: user.weight,
        gender: user.gender,
        activity_level: user.activity_level,
        setup_completed: user.setup_completed,
      },
    });
  } catch (err) {
    console.error("login error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update just the profile photo
const updatePhoto = async (req, res) => {
  try {
    const { profile_image } = req.body;
    if (!profile_image) {
      return res.status(400).json({ success: false, message: "profile_image is required." });
    }
    await pool.query(
      "UPDATE users SET profile_image=$1, updated_at=NOW() WHERE user_id=$2",
      [profile_image, req.user.user_id]
    );
    res.json({ success: true, message: "Photo updated." });
  } catch (err) {
    console.error("updatePhoto error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, first_name, last_name, email, gender, birth_date, age, height, weight,
              fitness_goal, activity_level, phone, profile_image,
              target_weight, workout_days_per_week, workout_duration, preferred_days,
              intensity, injuries, health_conditions, trainer_id, setup_completed
       FROM users WHERE user_id = $1`,
      [req.user.user_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getProfile error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update profile
const updateProfile = async (req, res) => {
  try {
    const {
      first_name, last_name, email, gender, birth_date, age, height, weight, fitness_goal, activity_level, phone,
      profile_image,
      target_weight, workout_days_per_week, workout_duration, preferred_days,
      intensity, injuries, health_conditions, trainer_id, setup_completed,
    } = req.body;



    // Calculate BMI
    let bmi = null;
    if (height && weight) {
      const h = parseFloat(height) / 100;
      bmi = (parseFloat(weight) / (h * h)).toFixed(2);
    }

    await pool.query(`
      UPDATE users SET first_name=$1, last_name=$2, email=$3, gender=$4, birth_date=$5,
        height=$6, weight=$7, fitness_goal=$8, activity_level=$9, phone=$10,
        age=COALESCE($11, age),
        target_weight=COALESCE($12, target_weight),
        workout_days_per_week=COALESCE($13, workout_days_per_week),
        workout_duration=COALESCE($14, workout_duration),
        preferred_days=COALESCE($15, preferred_days),
        intensity=COALESCE($16, intensity),
        injuries=COALESCE($17, injuries),
        health_conditions=COALESCE($18, health_conditions),
        trainer_id=COALESCE($19, trainer_id),
        setup_completed=COALESCE($20, setup_completed),
        profile_image=COALESCE($21, profile_image),
        updated_at=NOW()
      WHERE user_id=$22
    `, [
      first_name, last_name, email, gender, birth_date || null, height || null, weight || null, fitness_goal, activity_level, phone,
      age ?? null,
      target_weight ?? null,
      workout_days_per_week ?? null,
      workout_duration ?? null,
      preferred_days ?? null,
      intensity ?? null,
      injuries ?? null,
      health_conditions ?? null,
      trainer_id ?? null,
      typeof setup_completed === "boolean" ? setup_completed : null,
      profile_image ?? null,
      req.user.user_id,
    ]);

    // Also update BMI in members table if linked
    if (bmi) {
      await pool.query(
        "UPDATE members SET bmi=$1 WHERE email=(SELECT email FROM users WHERE user_id=$2)",
        [bmi, req.user.user_id]
      ).catch(() => {}); // silently fail if member not found
    }

    res.json({ success: true, message: "Profile updated." });
  } catch (err) {
    console.error("updateProfile error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, updatePhoto };