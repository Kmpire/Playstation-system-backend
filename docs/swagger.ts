import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { API_DESCRIPTION, API_URL } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findSwaggerJsonPath(): string | null {
  const candidates = [
    path.resolve(process.cwd(), "docs/swagger.json"),
    path.join(__dirname, "swagger.json"),
    path.resolve(__dirname, "../docs/swagger.json"),
    path.resolve(__dirname, "../../docs/swagger.json"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function loadSwaggerSpec() {
  const swaggerPath = findSwaggerJsonPath();
  if (swaggerPath) {
    try {
      const raw = fs.readFileSync(swaggerPath, "utf8");
      const parsed = JSON.parse(raw);
      parsed.servers = [
        {
          url: API_URL || "http://localhost:5001/api/v1",
          description: API_DESCRIPTION || "Local server",
        },
      ];
      return parsed;
    } catch (e) {
      console.error("Failed to parse swagger.json:", e);
    }
  }

  return {
    openapi: "3.0.0",
    info: {
      title: "Playstation System API",
      version: "1.0.0",
    },
    paths: {},
  };
}

export const swaggerSpec = loadSwaggerSpec();
