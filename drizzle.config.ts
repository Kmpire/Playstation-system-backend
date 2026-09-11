import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
if (!process.env.DATABASE_URL) {
  config({ path: ".env" });
}

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
