import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { users } from "../database/schema.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import { seedAccounts } from "../database/seed.js";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: "Username and password are required" });
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAccounts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
    }).from(users);
    res.json({ success: true, data: allUsers });
  } catch (error) {
    next(error);
  }
};

export const saveAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = req.body; // Array of accounts
    if (!Array.isArray(accounts)) {
      res.status(400).json({ success: false, message: "Expected array of accounts" });
      return;
    }

    // Upsert or insert each
    for (const acc of accounts) {
      const [existing] = await db.select().from(users).where(eq(users.username, acc.username));
      const password = acc.password ? await bcrypt.hash(acc.password, 10) : undefined;

      if (existing) {
        await db.update(users)
          .set({
            name: acc.name || existing.name,
            role: acc.role || existing.role,
            ...(password ? { password } : {}),
            updatedAt: new Date(),
          })
          .where(eq(users.username, acc.username));
      } else if (password) {
        await db.insert(users).values({
          username: acc.username,
          name: acc.name,
          role: acc.role || "cashier",
          password,
        });
      }
    }

    res.json({ success: true, message: "Accounts saved successfully" });
  } catch (error) {
    next(error);
  }
};

export const resetAccounts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await db.delete(users);
    for (const acc of seedAccounts) {
      const hashedPassword = await bcrypt.hash(acc.password, 10);
      await db.insert(users).values({
        username: acc.username,
        name: acc.name,
        role: acc.role,
        password: hashedPassword,
      });
    }
    res.json({ success: true, message: "Accounts reset to defaults" });
  } catch (error) {
    next(error);
  }
};
