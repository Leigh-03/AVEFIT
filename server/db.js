const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL pool error:", err);
});

/**
 * Ensure the approval columns exist before the API starts accepting requests.
 * This keeps the app working even when the migration SQL was not manually run.
 */
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'Pending'
    `);

    // Existing completed accounts should remain usable. Existing unfinished
    // accounts stay pending so the admin can review them.
    await client.query(`
      UPDATE users
      SET account_status = CASE
        WHEN COALESCE(setup_completed, FALSE) = TRUE THEN 'Active'
        ELSE COALESCE(account_status, 'Pending')
      END
      WHERE account_status IS NULL
         OR (account_status = 'Pending' AND COALESCE(setup_completed, FALSE) = TRUE)
    `);

    await client.query(`
      ALTER TABLE users
      ALTER COLUMN account_status SET DEFAULT 'Pending'
    `);

    // Security/session invalidation columns. Incrementing token_version
    // immediately invalidates previously issued JWTs.
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0`);
    await client.query(`ALTER TABLE trainers ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0`);
    await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0`);
    await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'Active'`);
    await client.query(`UPDATE admins SET account_status = 'Active' WHERE account_status IS NULL`);

    // Prevent duplicate accounts that differ only by email casing.
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (LOWER(email))`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS trainers_email_lower_unique ON trainers (LOWER(email)) WHERE email IS NOT NULL`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS admins_email_lower_unique ON admins (LOWER(email))`);

    // Trainers already in the database remain available. New trainers are
    // created as Pending by trainerController.js and require admin approval.
    await client.query(`
      ALTER TABLE trainers
      ALTER COLUMN status SET DEFAULT 'Pending'
    `);

    await client.query("COMMIT");
    console.log("✅ Database approval schema ready");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Database schema initialization failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = pool;
module.exports.initializeDatabase = initializeDatabase;
