const pool = require("../db");

// GET all trainers
const getTrainers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM trainers ORDER BY created_at DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getTrainers error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET trainer by ID
const getTrainerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM trainers WHERE trainer_id = $1",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Trainer not found." });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getTrainerById error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create trainer
const createTrainer = async (req, res) => {
  try {
    const { full_name, email, phone, specialization } = req.body;
    const result = await pool.query(`
      INSERT INTO trainers (full_name, email, phone, specialization)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [full_name, email, phone, specialization]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("createTrainer error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update trainer
const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, specialization, status } = req.body;
    await pool.query(`
      UPDATE trainers
      SET full_name=$1, email=$2, phone=$3, specialization=$4, status=$5, updated_at=NOW()
      WHERE trainer_id=$6
    `, [full_name, email, phone, specialization, status, id]);
    res.json({ success: true, message: "Trainer updated." });
  } catch (err) {
    console.error("updateTrainer error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT deactivate trainer
const deactivateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE trainers SET status = 'Inactive', updated_at = NOW() WHERE trainer_id = $1",
      [id]
    );
    res.json({ success: true, message: "Trainer deactivated." });
  } catch (err) {
    console.error("deactivateTrainer error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET active trainers for the member-facing coach selection screen
const getActiveTrainers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT trainer_id, full_name, specialization, goal_specialty, photo_url, bio, phone, email
      FROM trainers
      WHERE status = 'Active' OR status IS NULL
      ORDER BY full_name ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getActiveTrainers error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET the members currently assigned to a trainer
const getTrainerRoster = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT user_id, first_name, last_name, email, phone, fitness_goal, target_weight,
             weight, height, activity_level, preferred_days, workout_days_per_week, workout_duration
      FROM users
      WHERE trainer_id = $1
      ORDER BY first_name ASC
    `, [id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getTrainerRoster error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTrainers, getTrainerById, createTrainer, updateTrainer, deactivateTrainer, getActiveTrainers, getTrainerRoster };