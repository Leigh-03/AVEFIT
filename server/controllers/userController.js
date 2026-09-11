const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateRegistration, validateEmail, validateName, validatePhone, validateImageDataUrl, normalizeEmail, publicUser } = require("../utils/security");

// POST register
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;
    const validationError = validateRegistration({ first_name, last_name, email, password, phone });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const normalizedEmail = normalizeEmail(email);
    const existing = await pool.query("SELECT user_id FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, message: "Email already registered." });

    // New accounts must be approved by the gym admin before they can log in.
    const accountStatus = "Pending";

    const hashed = await bcrypt.hash(password, 12);
    const result = await pool.query(`
      INSERT INTO users (first_name, last_name, email, password, phone, account_status)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING user_id, first_name, last_name, email, phone, account_status, trainer_id, fitness_goal, height, weight, gender, activity_level, setup_completed
    `, [String(first_name).trim(), String(last_name).trim(), normalizedEmail, hashed, phone ? String(phone).trim() : null, accountStatus]);

    const user = result.rows[0];

    // Do not issue a token yet. The account must be approved by an admin first.
    res.status(201).json({
      success: true,
      message: "Account created and submitted for approval.",
      user,
      pending_approval: true,
    });
  } catch (err) {
    console.error("register error:", err.message);
    if (err.code === "23505") return res.status(409).json({ success: false, message: "Email already registered." });
    res.status(500).json({ success: false, message: "Unable to create account." });
  }
};

// POST login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validateEmail(email) || typeof password !== "string" || password.length === 0)
      return res.status(400).json({ success: false, message: "Please provide a valid email and password." });
    const normalizedEmail = normalizeEmail(email);
    const result = await pool.query("SELECT user_id, first_name, last_name, email, password, phone, account_status, trainer_id, fitness_goal, height, weight, gender, activity_level, setup_completed, profile_image, token_version FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
    if (result.rows.length === 0)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const user = result.rows[0];

    // Always verify the password before revealing the account approval status.
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const accountStatus = String(user.account_status || "pending").toLowerCase();

    if (accountStatus !== "active") {
      if (accountStatus === "rejected") {
        return res.status(403).json({
          success: false,
          status: "Rejected",
          message: "Your AveFit account was not approved. Please contact the gym administrator for assistance."
        });
      }

      return res.status(403).json({
        success: false,
        status: "Pending",
        message: "Your account is still pending approval. Please wait 1-3 working days while the gym administrator reviews your registration."
      });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, token_version: Number(user.token_version || 0) },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      user: publicUser(user),
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
    if (!profile_image) return res.status(400).json({ success: false, message: "profile_image is required." });
    const imageCheck = validateImageDataUrl(profile_image);
    if (!imageCheck.ok) return res.status(400).json({ success: false, message: imageCheck.message });
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
              intensity, injuries, health_conditions, trainer_id, setup_completed, account_status
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



    if (first_name !== undefined && !validateName(first_name)) return res.status(400).json({ success: false, message: "Invalid first name." });
    if (last_name !== undefined && !validateName(last_name)) return res.status(400).json({ success: false, message: "Invalid last name." });
    if (email !== undefined && !validateEmail(email)) return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    if (phone !== undefined && !validatePhone(phone)) return res.status(400).json({ success: false, message: "Please provide a valid phone number." });
    if (profile_image !== undefined && profile_image !== null && profile_image !== "") {
      const imageCheck = validateImageDataUrl(profile_image);
      if (!imageCheck.ok) return res.status(400).json({ success: false, message: imageCheck.message });
    }

    // When onboarding selects a coach, make sure the coach is still active.
    if (trainer_id !== undefined && trainer_id !== null && trainer_id !== "") {
      const trainerCheck = await pool.query(
        `SELECT trainer_id FROM trainers
         WHERE trainer_id = $1
         AND (status = 'Active' OR status IS NULL)`,
        [trainer_id]
      );

      if (trainerCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "The selected coach is not available."
        });
      }
    }

    // Normalize workout duration so PostgreSQL accepts both UI values like
    // "45 mins" and numeric values. The database stores the duration in minutes.
    let normalizedWorkoutDuration = null;
    if (workout_duration !== undefined && workout_duration !== null && workout_duration !== "") {
      const durationMatch = String(workout_duration).match(/\d+/);
      if (!durationMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid workout duration. Please choose a valid duration."
        });
      }
      normalizedWorkoutDuration = parseInt(durationMatch[0], 10);
    }

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
      first_name ? String(first_name).trim() : first_name, last_name ? String(last_name).trim() : last_name, email ? normalizeEmail(email) : email, gender, birth_date || null, height || null, weight || null, fitness_goal, activity_level, phone,
      age ?? null,
      target_weight ?? null,
      workout_days_per_week ?? null,
      normalizedWorkoutDuration,
      preferred_days ?? null,
      intensity ?? null,
      injuries ?? null,
      health_conditions ?? null,
      trainer_id ?? null,
      typeof setup_completed === "boolean" ? setup_completed : null,
      profile_image ?? null,
      req.user.user_id,
    ]);

    // Keep the admin member record synchronized with the registered user.
    // A member record is created the first time onboarding is completed;
    // existing records keep their current approval status.
    if (typeof setup_completed === "boolean" && setup_completed === true) {
      const userResult = await pool.query(
        `SELECT user_id, first_name, last_name, email, phone, gender, age,
                height, weight, fitness_goal, trainer_id
         FROM users WHERE user_id = $1`,
        [req.user.user_id]
      );
      const u = userResult.rows[0];
      if (u) {
        const existingMember = await pool.query(
          `SELECT member_id, status FROM members WHERE LOWER(email) = LOWER($1) ORDER BY member_id LIMIT 1`,
          [u.email]
        );

        const memberName = `${u.first_name || ""} ${u.last_name || ""}`.trim();
        if (existingMember.rows.length === 0) {
          await pool.query(`
            INSERT INTO members
              (full_name, email, phone, gender, age, height, weight, bmi,
               fitness_goal, status, trainer_id)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Pending',$10)
          `, [
            memberName, u.email, u.phone, u.gender, u.age, u.height, u.weight,
            bmi || null, u.fitness_goal, u.trainer_id || null
          ]);
        } else {
          await pool.query(`
            UPDATE members
            SET full_name=$1, phone=$2, gender=$3, age=$4, height=$5,
                weight=$6, bmi=COALESCE($7,bmi), fitness_goal=$8,
                trainer_id=COALESCE($9, trainer_id)
            WHERE member_id=$10
          `, [
            memberName, u.phone, u.gender, u.age, u.height, u.weight,
            bmi || null, u.fitness_goal, u.trainer_id || null,
            existingMember.rows[0].member_id
          ]);
        }
      }
    } else if (bmi) {
      await pool.query(
        "UPDATE members SET bmi=$1 WHERE email=(SELECT email FROM users WHERE user_id=$2)",
        [bmi, req.user.user_id]
      ).catch(() => {});
    }

    res.json({ success: true, message: "Profile updated." });
  } catch (err) {
    console.error("updateProfile error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, updatePhoto };