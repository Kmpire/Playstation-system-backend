import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.middleware.js";
import { db } from "../database/db.js";
import { users } from "../database/schema.js";
import { eq } from "drizzle-orm";

const router = Router();
const authCtrl = new AuthController();

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authCtrl.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
  }
};

export const getAccounts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authCtrl.getAccounts();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authCtrl.saveAccounts(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetAccounts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authCtrl.resetAccounts();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caller = req.user;
    if (!caller) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { username, currentPassword } = req.body;
    // Users can only change their own password unless they are an admin
    if (caller.role !== "admin" && caller.username.toLowerCase() !== username?.trim().toLowerCase()) {
      res.status(403).json({ success: false, message: "Forbidden: You can only change your own password" });
      return;
    }

    // Non-admins must provide current password
    if (caller.role !== "admin" && !currentPassword) {
      res.status(400).json({ success: false, message: "Current password is required" });
      return;
    }

    const result = await authCtrl.changePassword(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

router.post("/login", login);
router.post("/change-password", authenticateToken, changePassword);
router.get("/me", authenticateToken, getCurrentUser);
router.get("/accounts", authenticateToken, getAccounts);
router.post("/accounts", authenticateToken, authorizeRole("admin"), saveAccounts);
router.post("/accounts/reset", authenticateToken, authorizeRole("admin"), resetAccounts);

export default router;
