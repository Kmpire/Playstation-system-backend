import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export interface AuthUserPayload {
  id: number;
  username: string;
  name: string;
  role: "admin" | "cashier";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      code: 401,
      message: "Access token required",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      code: 403,
      message: "Invalid or expired token",
    });
  }
};

export const authorizeRole = (role: "admin" | "cashier") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role !== role && req.user.role !== "admin")) {
      res.status(403).json({
        success: false,
        code: 403,
        message: "Forbidden: insufficient permissions",
      });
      return;
    }
    next();
  };
};
