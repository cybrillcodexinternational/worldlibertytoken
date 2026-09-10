const mysql = require("mysql2/promise");

async function main() {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email || !role) {
    console.error("Usage: node scripts/set-user-role.js <email> <user|admin>");
    process.exit(1);
  }

  if (!["user", "admin"].includes(role)) {
    console.error("Role must be 'user' or 'admin'.");
    process.exit(1);
  }

  const db = await mysql.createConnection({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "worldlibertytoken",
  });

  const [updateResult] = await db.query("UPDATE users SET role = ? WHERE email = ?", [role, email]);
  if (updateResult.affectedRows === 0) {
    await db.end();
    console.error("No user found with that email.");
    process.exit(1);
  }

  const [rows] = await db.query("SELECT email, role FROM users WHERE email = ? LIMIT 1", [email]);
  await db.end();
  console.log(JSON.stringify(rows[0]));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
