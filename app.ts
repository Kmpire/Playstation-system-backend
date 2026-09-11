import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { CLIENT_ORIGIN, NODE_ENV } from "./config/env.js";
import apiRouter from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: CLIENT_ORIGIN === "*" ? true : CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/v1", apiRouter);

// Root greeting
app.get("/", (_req, res) => {
  res.json({
    message: "Playstation System API is running",
    version: "1.0.0",
    docs: "/api/v1/health",
  });
});

// Error handling middleware (must be after routes)
app.use(errorMiddleware);

export default app;
