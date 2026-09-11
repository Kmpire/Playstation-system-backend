import type { Request, Response, NextFunction } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { shiftReports } from "../database/schema.js";
import { seedShiftReports } from "../database/seed.js";

export const getShiftReports = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await db.select().from(shiftReports).orderBy(desc(shiftReports.date));
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const addShiftReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = req.body;
    await db.insert(shiftReports).values({
      id: item.id || "sr_" + Date.now(),
      date: item.date,
      staff: item.staff,
      countedCash: item.countedCash,
      expectedCash: item.expectedCash,
      variance: item.variance,
      notes: item.notes || "",
    });
    res.json({ success: true, message: "Shift report added" });
  } catch (error) {
    next(error);
  }
};

export const saveAllShiftReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = req.body;
    if (!Array.isArray(list)) {
      res.status(400).json({ success: false, message: "Expected array of shift reports" });
      return;
    }

    for (const item of list) {
      const [existing] = await db
        .select()
        .from(shiftReports)
        .where(eq(shiftReports.id, item.id));

      if (existing) {
        await db
          .update(shiftReports)
          .set({
            date: item.date,
            staff: item.staff,
            countedCash: item.countedCash,
            expectedCash: item.expectedCash,
            variance: item.variance,
            notes: item.notes || "",
          })
          .where(eq(shiftReports.id, item.id));
      } else {
        await db.insert(shiftReports).values({
          id: item.id || "sr_" + Date.now(),
          date: item.date,
          staff: item.staff,
          countedCash: item.countedCash,
          expectedCash: item.expectedCash,
          variance: item.variance,
          notes: item.notes || "",
        });
      }
    }

    const all = await db.select().from(shiftReports).orderBy(desc(shiftReports.date));
    res.json({ success: true, data: all });
  } catch (error) {
    next(error);
  }
};

export const resetShiftReports = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await db.delete(shiftReports);
    for (const sr of seedShiftReports) {
      await db.insert(shiftReports).values(sr);
    }
    const all = await db.select().from(shiftReports).orderBy(desc(shiftReports.date));
    res.json({ success: true, data: all });
  } catch (error) {
    next(error);
  }
};
