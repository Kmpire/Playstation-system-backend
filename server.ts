import app from "./app.js";
import { PORT, NODE_ENV } from "./config/env.js";
import { checkDatabaseConnection } from "./database/db.js";
import { autoSeedDatabase } from "./database/seed.js";

async function startServer() {
  console.log(`🚀 Starting Playstation System Backend in ${NODE_ENV} mode...`);

  // Check database connection and run auto-seeder if empty
  const isConnected = await checkDatabaseConnection();
  if (isConnected) {
    await autoSeedDatabase();
  } else {
    console.warn("⚠️  Server starting without active database connection. Add DATABASE_URL to .env.development.local");
  }

  app.listen(PORT, () => {
    console.log(`🎮 Playstation API Server listening on http://localhost:${PORT}`);
    console.log(`👉 Health check: http://localhost:${PORT}/api/v1/health`);
  });
}

// Check if running directly as a standalone process (not imported by Vercel serverless)
if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
