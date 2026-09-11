import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "./schema.js";
import { DATABASE_URL, NODE_ENV } from "../config/env.js";

interface CachedDb {
  db: NeonHttpDatabase<typeof schema> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __neon_db__: CachedDb | undefined;
}

let cached = global.__neon_db__;

if (!cached) {
  cached = global.__neon_db__ = {
    db: null,
  };
}

export function getDatabase(): NeonHttpDatabase<typeof schema> {
  if (!DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not defined! Please set your Neon PostgreSQL connection string in .env.development.local or environment variables."
    );
  }

  if (cached && cached.db) {
    return cached.db;
  }

  const sql = neon(DATABASE_URL);
  const db = drizzle(sql, { schema });

  if (cached) {
    cached.db = db;
  }

  return db;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    if (!DATABASE_URL || DATABASE_URL.includes("your_password")) {
      console.warn(
        "⚠️  DATABASE_URL contains placeholder credentials. Please paste your actual Neon PostgreSQL URL in .env.development.local"
      );
      return false;
    }
    const db = getDatabase();
    // Test query
    await db.execute(sql`SELECT 1;`);
    console.log(`✅ Connected to Neon PostgreSQL database (${NODE_ENV})`);
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to Neon PostgreSQL database:", error);
    return false;
  }
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (instance as any)[prop];
  },
});

export default db;
