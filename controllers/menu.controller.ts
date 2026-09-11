import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { menuItems, categories } from "../database/schema.js";
import { seedMenuItems, seedCategories } from "../database/seed.js";

// --- Menu Items ---
export const getItems = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db.select().from(menuItems);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const saveItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = req.body;
    const [existing] = await db.select().from(menuItems).where(eq(menuItems.id, item.id));

    if (existing) {
      await db
        .update(menuItems)
        .set({
          name: item.name,
          nameAr: item.nameAr,
          category: item.category,
          price: item.price,
          costPrice: item.costPrice ?? existing.costPrice,
          stock: item.stock ?? existing.stock,
          lowStockThreshold: item.lowStockThreshold ?? existing.lowStockThreshold,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, item.id));
    } else {
      await db.insert(menuItems).values({
        id: item.id,
        name: item.name,
        nameAr: item.nameAr,
        category: item.category,
        price: item.price,
        costPrice: item.costPrice || 0,
        stock: item.stock || 0,
        lowStockThreshold: item.lowStockThreshold || 5,
      });
    }

    const [updated] = await db.select().from(menuItems).where(eq(menuItems.id, item.id));
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const saveAllItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, message: "Expected array of items" });
      return;
    }

    for (const item of items) {
      const [existing] = await db.select().from(menuItems).where(eq(menuItems.id, item.id));
      if (existing) {
        await db
          .update(menuItems)
          .set({
            name: item.name,
            nameAr: item.nameAr,
            category: item.category,
            price: item.price,
            costPrice: item.costPrice ?? existing.costPrice,
            stock: item.stock ?? existing.stock,
            lowStockThreshold: item.lowStockThreshold ?? existing.lowStockThreshold,
            updatedAt: new Date(),
          })
          .where(eq(menuItems.id, item.id));
      } else {
        await db.insert(menuItems).values({
          id: item.id,
          name: item.name,
          nameAr: item.nameAr,
          category: item.category,
          price: item.price,
          costPrice: item.costPrice || 0,
          stock: item.stock || 0,
          lowStockThreshold: item.lowStockThreshold || 5,
        });
      }
    }

    const all = await db.select().from(menuItems);
    res.json({ success: true, data: all });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    await db.delete(menuItems).where(eq(menuItems.id, id));
    res.json({ success: true, message: `Item ${id} deleted` });
  } catch (error) {
    next(error);
  }
};

export const resetItems = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await db.delete(menuItems);
    for (const m of seedMenuItems) {
      await db.insert(menuItems).values(m);
    }
    const all = await db.select().from(menuItems);
    res.json({ success: true, data: all });
  } catch (error) {
    next(error);
  }
};

// --- Categories ---
export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await db.select().from(categories);
    res.json({ success: true, data: cats });
  } catch (error) {
    next(error);
  }
};

export const saveCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = req.body;
    const [existing] = await db.select().from(categories).where(eq(categories.id, cat.id));

    if (existing) {
      await db
        .update(categories)
        .set({
          name: cat.name,
          nameAr: cat.nameAr,
        })
        .where(eq(categories.id, cat.id));
    } else {
      await db.insert(categories).values({
        id: cat.id,
        name: cat.name,
        nameAr: cat.nameAr,
      });
    }

    const [updated] = await db.select().from(categories).where(eq(categories.id, cat.id));
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const saveAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = req.body;
    if (!Array.isArray(list)) {
      res.status(400).json({ success: false, message: "Expected array of categories" });
      return;
    }

    for (const cat of list) {
      const [existing] = await db.select().from(categories).where(eq(categories.id, cat.id));
      if (existing) {
        await db
          .update(categories)
          .set({ name: cat.name, nameAr: cat.nameAr })
          .where(eq(categories.id, cat.id));
      } else {
        await db.insert(categories).values({ id: cat.id, name: cat.name, nameAr: cat.nameAr });
      }
    }

    const all = await db.select().from(categories);
    res.json({ success: true, data: all });
  } catch (error) {
    next(error);
  }
};

export const resetCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await db.delete(categories);
    for (const c of seedCategories) {
      await db.insert(categories).values(c);
    }
    const all = await db.select().from(categories);
    res.json({ success: true, data: all });
  } catch (error) {
    next(error);
  }
};
