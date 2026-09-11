import type { Request, Response, NextFunction } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { consoles } from "../database/schema.js";
import { seedConsoles } from "../database/seed.js";

export const getAllConsoles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await db.select().from(consoles).orderBy(asc(consoles.id));
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const getConsoleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const [item] = await db.select().from(consoles).where(eq(consoles.id, id));
    if (!item) {
      res.status(404).json({ success: false, message: "Console not found" });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const saveConsole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consoleData = req.body;
    const id = Number(consoleData.id);

    const [existing] = await db.select().from(consoles).where(eq(consoles.id, id));
    if (existing) {
      const nextSession =
        consoleData.status === "available" || consoleData.session === null
          ? null
          : consoleData.session !== undefined
          ? consoleData.session
          : existing.session;

      await db
        .update(consoles)
        .set({
          name: consoleData.name,
          type: consoleData.type,
          status: consoleData.status,
          dailyTotal: consoleData.dailyTotal ?? existing.dailyTotal,
          session: nextSession,
          updatedAt: new Date(),
        })
        .where(eq(consoles.id, id));
    } else {
      await db.insert(consoles).values({
        id,
        name: consoleData.name,
        type: consoleData.type,
        status: consoleData.status || "available",
        dailyTotal: consoleData.dailyTotal || 0,
        session: consoleData.status === "available" ? null : consoleData.session || null,
      });
    }

    const [updated] = await db.select().from(consoles).where(eq(consoles.id, id));
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const saveAllConsoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, message: "Expected array of consoles" });
      return;
    }

    for (const item of items) {
      const id = Number(item.id);
      const [existing] = await db.select().from(consoles).where(eq(consoles.id, id));
      const nextSession =
        item.status === "available" || item.session === null
          ? null
          : item.session !== undefined
          ? item.session
          : existing?.session ?? null;

      if (existing) {
        await db
          .update(consoles)
          .set({
            name: item.name,
            type: item.type,
            status: item.status,
            dailyTotal: item.dailyTotal ?? existing.dailyTotal,
            session: nextSession,
            updatedAt: new Date(),
          })
          .where(eq(consoles.id, id));
      } else {
        await db.insert(consoles).values({
          id,
          name: item.name,
          type: item.type,
          status: item.status || "available",
          dailyTotal: item.dailyTotal || 0,
          session: nextSession,
        });
      }
    }

    const list = await db.select().from(consoles).orderBy(asc(consoles.id));
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const deleteConsole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await db.delete(consoles).where(eq(consoles.id, id));
    res.json({ success: true, message: `Console #${id} deleted` });
  } catch (error) {
    next(error);
  }
};

export const resetConsoles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await db.delete(consoles);
    for (const con of seedConsoles) {
      await db.insert(consoles).values(con);
    }
    const list = await db.select().from(consoles).orderBy(asc(consoles.id));
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};
