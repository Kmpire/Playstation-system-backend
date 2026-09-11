import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { companyInfo } from "../database/schema.js";
import { seedCompany } from "../database/seed.js";

export const getCompanyInfo = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [info] = await db.select().from(companyInfo).where(eq(companyInfo.id, 1));
    if (!info) {
      // Return default seed if not populated yet
      res.json({ success: true, data: seedCompany });
      return;
    }
    res.json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const info = req.body;
    const [existing] = await db.select().from(companyInfo).where(eq(companyInfo.id, 1));

    if (existing) {
      await db
        .update(companyInfo)
        .set({
          name: info.name ?? existing.name,
          nameAr: info.nameAr ?? existing.nameAr,
          phone: info.phone ?? existing.phone,
          email: info.email ?? existing.email,
          address: info.address ?? existing.address,
          addressAr: info.addressAr ?? existing.addressAr,
          socials: info.socials ?? existing.socials,
          updatedAt: new Date(),
        })
        .where(eq(companyInfo.id, 1));
    } else {
      await db.insert(companyInfo).values({
        id: 1,
        name: info.name || seedCompany.name,
        nameAr: info.nameAr || seedCompany.nameAr,
        phone: info.phone,
        email: info.email,
        address: info.address,
        addressAr: info.addressAr,
        socials: info.socials || seedCompany.socials,
      });
    }

    const [updated] = await db.select().from(companyInfo).where(eq(companyInfo.id, 1));
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
