const pool = require("../db");

const getWorkouts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, c.category_name
      FROM exercises e
      LEFT JOIN exercise_categories c ON e.category_id = c.category_id
      ORDER BY e.exercise_name ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getWorkouts error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM exercise_categories ORDER BY category_name ASC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createWorkout = async (req, res) => {
  try {
    const { exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment, video_url } = req.body;
    const result = await pool.query(`
      INSERT INTO exercises (exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment, video_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [exercise_name, category_id || null, muscle_group, difficulty, calories_per_minute || null, description, equipment, video_url]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { exercise_name, category_id, muscle_group, difficulty, calories_per_minute, description, equipment, video_url } = req.body;
    await pool.query(`
      UPDATE exercises SET exercise_name=$1, category_id=$2, muscle_group=$3, difficulty=$4,
      calories_per_minute=$5, description=$6, equipment=$7, video_url=$8 WHERE exercise_id=$9
    `, [exercise_name, category_id || null, muscle_group, difficulty, calories_per_minute || null, description, equipment, video_url, id]);
    res.json({ success: true, message: "Exercise updated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    await pool.query("DELETE FROM exercises WHERE exercise_id = $1", [req.params.id]);
    res.json({ success: true, message: "Exercise deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getWorkoutPlans = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT wp.workout_plan_id, wp.plan_name, wp.goal, wp.status, wp.created_at,
        u.first_name || ' ' || u.last_name AS member_name, u.user_id,
        t.full_name AS trainer_name
      FROM workout_plans wp
      LEFT JOIN users u ON wp.user_id = u.user_id
      LEFT JOIN trainers t ON wp.trainer_id = t.trainer_id
      ORDER BY wp.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createWorkoutPlan = async (req, res) => {
  try {
    const { user_id, trainer_id, plan_name, goal } = req.body;
    const result = await pool.query(`
      INSERT INTO workout_plans (user_id, trainer_id, plan_name, goal)
      VALUES ($1,$2,$3,$4) RETURNING *
    `, [user_id || null, trainer_id || null, plan_name, goal]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteWorkoutPlan = async (req, res) => {
  try {
    await pool.query("DELETE FROM workout_plans WHERE workout_plan_id = $1", [req.params.id]);
    res.json({ success: true, message: "Workout plan deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getWorkouts, getCategories, createWorkout, updateWorkout, deleteWorkout, getWorkoutPlans, createWorkoutPlan, deleteWorkoutPlan };