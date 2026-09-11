import type { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  code?: number | string;
  errors?: Record<string, { message: string }>;
}

export const errorMiddleware = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  console.error("Backend Error:", err);

  // PostgreSQL duplicate key (error code 23505)
  if (err.code === "23505") {
    const message = "Duplicate field value entered";
    error = new Error(message);
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || (typeof err.statusCode === "number" ? err.statusCode : 500);

  res.status(statusCode).json({
    code: statusCode,
    message: error.message || "Server Error",
    success: false,
  });
};

export default errorMiddleware;
