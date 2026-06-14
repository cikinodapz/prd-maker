import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection string dari Supabase
// Gunakan pooler connection (port 6543) untuk serverless/edge
const connectionString = process.env.DATABASE_URL!;

// Untuk menghindari multiple connections saat hot-reload di development
const globalForDb = globalThis as unknown as {
  connection: postgres.Sql | undefined;
};

const connection =
  globalForDb.connection ??
  postgres(connectionString, {
    prepare: false, // Diperlukan untuk Supabase pooler (Transaction mode)
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.connection = connection;
}

// Export Drizzle instance dengan schema untuk query builder yang type-safe
export const db = drizzle(connection, { schema });
