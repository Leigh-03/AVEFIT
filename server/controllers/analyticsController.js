const pool = require("../db");

// GET dashboard summary stats
const getDashboardStats = async (req, res) => {
  try {
    const totalMembers = await pool.query("SELECT COUNT(*) AS count FROM members");
    const activeMembers = await pool.query("SELECT COUNT(*) AS count FROM members WHERE status = 'Active'");
    const pendingMembers = await pool.query("SELECT COUNT(*) AS count FROM members WHERE status = 'Pending'");
    const totalExercises = await pool.query("SELECT COUNT(*) AS count FROM exercises");
    const totalMealPlans = await pool.query("SELECT COUNT(*) AS count FROM meal_plans");

    const recentMembers = await pool.query(`
      SELECT member_id, full_name, status, joined_date
      FROM members ORDER BY joined_date DESC LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalMembers: parseInt(totalMembers.rows[0].count),
        activeMembers: parseInt(activeMembers.rows[0].count),
        pendingMembers: parseInt(pendingMembers.rows[0].count),
        totalExercises: parseInt(totalExercises.rows[0].count),
        totalMealPlans: parseInt(totalMealPlans.rows[0].count),
        recentMembers: recentMembers.rows,
      },
    });
  } catch (err) {
    console.error("getDashboardStats error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET full analytics
const getAnalytics = async (req, res) => {
  try {
    // Member growth last 6 months
    const memberGrowth = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', joined_date), 'Mon') AS month,
        COUNT(*) AS count
      FROM members
      WHERE joined_date >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', joined_date)
      ORDER BY DATE_TRUNC('month', joined_date) ASC
    `);

    // Fitness goal distribution
    const goalDistribution = await pool.query(`
      SELECT fitness_goal AS goal, COUNT(*) AS count
      FROM members
      WHERE fitness_goal IS NOT NULL
      GROUP BY fitness_goal ORDER BY count DESC
    `);

    // BMI distribution
    const bmiDistribution = await pool.query(`
      SELECT
        CASE
          WHEN bmi < 18.5 THEN 'Underweight'
          WHEN bmi BETWEEN 18.5 AND 24.9 THEN 'Normal'
          WHEN bmi BETWEEN 25 AND 29.9 THEN 'Overweight'
          ELSE 'Obese'
        END AS category,
        COUNT(*) AS count
      FROM members WHERE bmi IS NOT NULL
      GROUP BY category
    `);

    // Workout sessions completed per month
    const attendance = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', session_date), 'Mon') AS month,
        COUNT(*) AS count
      FROM workout_sessions
      WHERE completed = true
        AND session_date >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', session_date)
      ORDER BY DATE_TRUNC('month', session_date) ASC
    `);

    // Summary
    const totalMembers = await pool.query("SELECT COUNT(*) AS count FROM members");
    const avgBmi = await pool.query("SELECT ROUND(AVG(bmi)::numeric,1) AS avg FROM members WHERE bmi IS NOT NULL");
    const totalWorkoutPlans = await pool.query("SELECT COUNT(*) AS count FROM workout_plans");
    const totalMealPlans = await pool.query("SELECT COUNT(*) AS count FROM meal_plans");

    res.json({
      success: true,
      data: {
        summary: {
          totalMembers: parseInt(totalMembers.rows[0].count),
          avgBmi: parseFloat(avgBmi.rows[0].avg) || 0,
          totalWorkoutPlans: parseInt(totalWorkoutPlans.rows[0].count),
          totalNutritionPlans: parseInt(totalMealPlans.rows[0].count),
        },
        memberGrowth: memberGrowth.rows,
        goalDistribution: goalDistribution.rows,
        bmiDistribution: bmiDistribution.rows,
        attendance: attendance.rows,
      },
    });
  } catch (err) {
    console.error("getAnalytics error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats, getAnalytics };