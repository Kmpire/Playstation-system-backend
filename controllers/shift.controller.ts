import { desc, eq } from "drizzle-orm";
import { Controller, Route, Tags, Get, Post, Body } from "tsoa";
import { db } from "../database/db.js";
import { shiftReports } from "../database/schema.js";
import { seedShiftReports } from "../database/seed.js";
import type {
  ShiftReportDto,
  ShiftListResponse,
  ShiftActionResponse,
} from "../types/shift.types.js";

@Route("api/v1/shifts")
@Tags("Shifts")
export class ShiftController extends Controller {
  @Get("")
  public async getShiftReports(): Promise<ShiftListResponse> {
    const list = await db.select().from(shiftReports).orderBy(desc(shiftReports.date));
    return { success: true, data: list as ShiftReportDto[] };
  }

  @Post("")
  public async addShiftReport(@Body() body: ShiftReportDto): Promise<ShiftActionResponse> {
    await db.insert(shiftReports).values({
      id: body.id || "sr_" + Date.now(),
      date: body.date,
      staff: body.staff,
      countedCash: body.countedCash,
      expectedCash: body.expectedCash,
      variance: body.variance,
      notes: body.notes || "",
    });
    return { success: true, message: "Shift report added" };
  }

  @Post("batch")
  public async saveAllShiftReports(@Body() list: ShiftReportDto[]): Promise<ShiftListResponse> {
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
    return { success: true, data: all as ShiftReportDto[] };
  }

  @Post("reset")
  public async resetShiftReports(): Promise<ShiftListResponse> {
    await db.delete(shiftReports);
    for (const sr of seedShiftReports) {
      await db.insert(shiftReports).values(sr);
    }
    const all = await db.select().from(shiftReports).orderBy(desc(shiftReports.date));
    return { success: true, data: all as ShiftReportDto[] };
  }
}
