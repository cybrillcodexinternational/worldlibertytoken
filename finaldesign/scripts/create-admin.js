const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const fullName = process.argv[4] || "Main Admin";

  if (!email || !password) {
    console.error("Usage: node scripts/create-admin.js <email> <password> [fullName]");
    process.exit(1);
  }

  const db = await mysql.createConnection({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "worldlibertytoken",
  });

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const passwordHash = await bcrypt.hash(password, 12);

  await db.query(
    "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'admin') ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), password_hash=VALUES(password_hash), role='admin'",
    [fullName, email, passwordHash]
  );

  const [rows] = await db.query(
    "SELECT email, role FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  await db.end();
  console.log(JSON.stringify(rows[0]));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
