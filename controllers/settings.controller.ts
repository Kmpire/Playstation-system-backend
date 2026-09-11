import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { appSettings } from "../database/schema.js";

export const getSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = String(req.params.key);
    const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key));
    res.json({ success: true, value: setting ? setting.value : null });
  } catch (error) {
    next(error);
  }
};

export const setSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = String(req.params.key);
    const { value } = req.body;
    const [existing] = await db.select().from(appSettings).where(eq(appSettings.key, key));

    if (existing) {
      await db
        .update(appSettings)
        .set({ value: String(value), updatedAt: new Date() })
        .where(eq(appSettings.key, key));
    } else {
      await db.insert(appSettings).values({ key, value: String(value) });
    }

    res.json({ success: true, message: `Setting '${key}' saved` });
  } catch (error) {
    next(error);
  }
};
