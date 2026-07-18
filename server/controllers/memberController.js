const pool = require("../db");

// GET all members
const getMembers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT member_id, full_name, email, phone, gender, age,
             height, weight, bmi, fitness_goal, status, joined_date
      FROM members ORDER BY joined_date DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getMembers error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET member by ID
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM members WHERE member_id = $1", [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Member not found." });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getMemberById error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create member
const createMember = async (req, res) => {
  try {
    const { full_name, email, phone, gender, age, height, weight, fitness_goal } = req.body;

    // Calculate BMI if height and weight provided
    let bmi = null;
    if (height && weight) {
      const heightM = parseFloat(height) / 100;
      bmi = (parseFloat(weight) / (heightM * heightM)).toFixed(2);
    }

    const result = await pool.query(`
      INSERT INTO members (full_name, email, phone, gender, age, height, weight, bmi, fitness_goal, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending')
      RETURNING *
    `, [full_name, email, phone, gender, age, height, weight, bmi, fitness_goal]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("createMember error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update member
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, gender, age, height, weight, fitness_goal, status } = req.body;

    let bmi = null;
    if (height && weight) {
      const heightM = parseFloat(height) / 100;
      bmi = (parseFloat(weight) / (heightM * heightM)).toFixed(2);
    }

    await pool.query(`
      UPDATE members
      SET full_name=$1, email=$2, phone=$3, gender=$4, age=$5,
          height=$6, weight=$7, bmi=$8, fitness_goal=$9, status=$10
      WHERE member_id=$11
    `, [full_name, email, phone, gender, age, height, weight, bmi, fitness_goal, status, id]);

    res.json({ success: true, message: "Member updated." });
  } catch (err) {
    console.error("updateMember error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT approve member
const approveMember = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE members SET status = 'Active' WHERE member_id = $1", [id]
    );
    res.json({ success: true, message: "Member approved." });
  } catch (err) {
    console.error("approveMember error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT reject member
const rejectMember = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE members SET status = 'Inactive' WHERE member_id = $1", [id]
    );
    res.json({ success: true, message: "Member deactivated." });
  } catch (err) {
    console.error("rejectMember error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE member
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM members WHERE member_id = $1", [id]);
    res.json({ success: true, message: "Member deleted." });
  } catch (err) {
    console.error("deleteMember error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET member body progress
const getMemberProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM progress_logs WHERE user_id = $1 ORDER BY log_date ASC", [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getMemberProgress error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMembers, getMemberById, createMember, updateMember,
  approveMember, rejectMember, deleteMember, getMemberProgress
};