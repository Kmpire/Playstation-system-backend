import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { JWT_SECRET } from "../config/env.js";
import { db } from "../database/db.js";
import { users } from "../database/schema.js";

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

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
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

    // Verify that the user actually exists in the database
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, decoded.id));

    if (!user) {
      res.status(401).json({
        success: false,
        code: 401,
        message: "حساب المستخدم لم يعد موجوداً في النظام / User account no longer exists",
      });
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role as "admin" | "cashier",
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      code: 401,
      message: "Invalid or expired token",
    });
  }
};

export const optionalAuthenticateToken = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      req.user = decoded;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
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
