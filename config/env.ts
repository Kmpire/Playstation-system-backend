import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
if (!process.env.DATABASE_URL) {
  config({ path: ".env" });
}

export const PORT = Number(process.env.PORT) || 5001;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_change_in_production";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";
