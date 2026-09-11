import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { controllers, maintenanceRecords } from "../database/schema.js";
import { seedControllers, seedMaintenanceRecords } from "../database/seed.js";

// --- Controllers ---
export const getAllControllers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await db.select().from(controllers);
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const saveController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = req.body;
    const [existing] = await db.select().from(controllers).where(eq(controllers.id, item.id));

    if (existing) {
      await db
        .update(controllers)
        .set({
          number: item.number,
          assignedTo: item.assignedTo,
          status: item.status,
          updatedAt: new Date(),
        })
        .where(eq(controllers.id, item.id));
    } else {
      await db.insert(controllers).values({
        id: item.id,
        number: item.number,
        assignedTo: item.assignedTo ?? null,
        status: item.status || "working",
      });
    }

    const [updated] = await db.select().from(controllers).where(eq(controllers.id, item.id));
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const saveAllControllers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = req.body;
    if (!Array.isArray(list)) {
      res.status(400).json({ success: false, message: "Expected array of controllers" });
      return;
    }

    for (const item of list) {
      const [existing] = await db.select().from(controllers).where(eq(controllers.id, item.id));
      if (existing) {
        await db
          .update(controllers)
          .set({
            number: item.number,
            assignedTo: item.assignedTo,
            status: item.status,
            updatedAt: new Date(),
          })
          .where(eq(controllers.id, item.id));
      } else {
        await db.insert(controllers).values({
          id: item.id,
          number: item.number,
          assignedTo: item.assignedTo ?? null,
          status: item.status || "working",
        });
      }
    }

    const all = await db.select().from(controllers);
    res.json({ success: true, data: all });
  } catch (error) {
    next(error);
  }
};

export const resetControllers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await db.delete(controllers);
    for (const c of seedControllers) {
      await db.insert(controllers).values(c);
    }
    const all = await db.select().from(controllers);
    res.json({ success: true, data: all });
  } catch (error) {
    next(error);
  }
};

// --- Maintenance Records ---
export const getMaintenanceRecords = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await db.select().from(maintenanceRecords);
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

export const addMaintenanceRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = req.body;
    await db.insert(maintenanceRecords).values({
      id: item.id || "mr_" + Date.now(),
      date: item.date,
      targetType: item.targetType,
      targetId: String(item.targetId),
      targetLabel: item.targetLabel,
      issue: item.issue,
      cost: item.cost || 0,
      resolvedBy: item.resolvedBy,
    });
    res.json({ success: true, message: "Maintenance record added" });
  } catch (error) {
    next(error);
  }
};

export const saveAllMaintenanceRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = req.body;
    if (!Array.isArray(list)) {
      res.status(400).json({ success: false, message: "Expected array of maintenance records" });
      return;
    }

    for (const item of list) {
      const [existing] = await db
        .select()
        .from(maintenanceRecords)
        .where(eq(maintenanceRecords.id, item.id));

      if (existing) {
        await db
          .update(maintenanceRecords)
          .set({
            date: item.date,
            targetType: item.targetType,
            targetId: String(item.targetId),
            targetLabel: item.targetLabel,
            issue: item.issue,
            cost: item.cost || 0,
            resolvedBy: item.resolvedBy,
          })
          .where(eq(maintenanceRecords.id, item.id));
      } else {
        await db.insert(maintenanceRecords).values({
          id: item.id || "mr_" + Date.now(),
          date: item.date,
          targetType: item.targetType,
          targetId: String(item.targetId),
          targetLabel: item.targetLabel,
          issue: item.issue,
          cost: item.cost || 0,
          resolvedBy: item.resolvedBy,
        });
      }
    }

    const records = await db.select().from(maintenanceRecords);
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};
