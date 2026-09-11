import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { pricingConfigs } from "../database/schema.js";
import { seedPricing } from "../database/seed.js";

export const getAllPricing = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await db.select().from(pricingConfigs);
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const saveAllPricing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = req.body;
    if (!Array.isArray(configs)) {
      res.status(400).json({ success: false, message: "Expected array of pricing configs" });
      return;
    }

    for (const item of configs) {
      const [existing] = await db
        .select()
        .from(pricingConfigs)
        .where(eq(pricingConfigs.type, item.type));

      if (existing) {
        await db
          .update(pricingConfigs)
          .set({
            singleRate: item.singleRate,
            multiRate: item.multiRate,
            updatedAt: new Date(),
          })
          .where(eq(pricingConfigs.type, item.type));
      } else {
        await db.insert(pricingConfigs).values({
          type: item.type,
          singleRate: item.singleRate,
          multiRate: item.multiRate,
        });
      }
    }

    const updated = await db.select().from(pricingConfigs);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const resetPricing = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await db.delete(pricingConfigs);
    for (const p of seedPricing) {
      await db.insert(pricingConfigs).values(p);
    }
    const list = await db.select().from(pricingConfigs);
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};
