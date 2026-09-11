import type { Request, Response, NextFunction } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { auditEntries } from "../database/schema.js";
import { seedAuditLog } from "../database/seed.js";

export const getLogs = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await db.select().from(auditEntries).orderBy(desc(auditEntries.timestamp));
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const addLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = req.body;
    await db.insert(auditEntries).values({
      id: item.id || "a_" + Date.now(),
      timestamp: item.timestamp || new Date().toISOString().replace("T", " ").slice(0, 19),
      staff: item.staff || "Staff",
      actionType: item.actionType,
      details: item.details,
    });
    res.json({ success: true, message: "Audit entry added" });
  } catch (error) {
    next(error);
  }
};

export const saveAllLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = req.body;
    if (!Array.isArray(list)) {
      res.status(400).json({ success: false, message: "Expected array of audit entries" });
      return;
    }

    for (const item of list) {
      const [existing] = await db
        .select()
        .from(auditEntries)
        .where(eq(auditEntries.id, item.id));

      if (existing) {
        await db
          .update(auditEntries)
          .set({
            timestamp: item.timestamp,
            staff: item.staff,
            actionType: item.actionType,
            details: item.details,
          })
          .where(eq(auditEntries.id, item.id));
      } else {
        await db.insert(auditEntries).values({
          id: item.id || "a_" + Date.now(),
          timestamp: item.timestamp,
          staff: item.staff,
          actionType: item.actionType,
          details: item.details,
        });
      }
    }

    const all = await db.select().from(auditEntries).orderBy(desc(auditEntries.timestamp));
    res.json({ success: true, data: all });
  } catch (error) {
    next(error);
  }
};

export const resetLogs = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await db.delete(auditEntries);
    for (const a of seedAuditLog) {
      await db.insert(auditEntries).values(a);
    }
    const all = await db.select().from(auditEntries).orderBy(desc(auditEntries.timestamp));
    res.json({ success: true, data: all });
  } catch (error) {
    next(error);
  }
};
