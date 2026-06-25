import postgres from "postgres";
import fs from "fs";
import path from "path";

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("No DATABASE_URL");
  
  const sql = postgres(connectionString);
  try {
    console.log("Dropping old tables...");
    await sql`DROP TABLE IF EXISTS "prds" CASCADE`;
    await sql`DROP TABLE IF EXISTS "subscriptions" CASCADE`;
    await sql`DROP TABLE IF EXISTS "profiles" CASCADE`;
    
    console.log("Applying migrations...");
    const file = fs.readFileSync(path.join(process.cwd(), "drizzle", "0000_blue_blizzard.sql"), "utf8");
    await sql.unsafe(file);
    console.log("Migrations applied successfully!");
  } catch(e) {
    console.error("Failed:", e);
  } finally {
    await sql.end();
  }
}
run();
