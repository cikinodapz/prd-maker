import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  out: "./drizzle", // Folder untuk menyimpan file migration
  schema: "./src/db/schema.ts", // Path ke file schema
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
