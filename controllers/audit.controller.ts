import { desc, eq } from "drizzle-orm";
import { Controller, Route, Tags, Get, Post, Body } from "tsoa";
import { db } from "../database/db.js";
import { auditEntries } from "../database/schema.js";
import { seedAuditLog } from "../database/seed.js";
import type {
  AuditEntryDto,
  AuditListResponse,
  AuditActionResponse,
} from "../types/audit.types.js";

@Route("api/v1/audit")
@Tags("Audit")
export class AuditController extends Controller {
  @Get("")
  public async getLogs(): Promise<AuditListResponse> {
    const list = await db.select().from(auditEntries).orderBy(desc(auditEntries.timestamp));
    return { success: true, data: list };
  }

  @Post("")
  public async addLog(@Body() item: AuditEntryDto): Promise<AuditActionResponse> {
    await db.insert(auditEntries).values({
      id: item.id || "a_" + Date.now(),
      timestamp: item.timestamp || new Date().toISOString().replace("T", " ").slice(0, 19),
      staff: item.staff || "Staff",
      actionType: item.actionType,
      details: item.details,
    });
    return { success: true, message: "Audit entry added" };
  }

  @Post("batch")
  public async saveAllLogs(@Body() list: AuditEntryDto[]): Promise<AuditActionResponse> {
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
    return { success: true, message: "Audit entries saved" };
  }

  @Post("reset")
  public async resetLogs(): Promise<AuditActionResponse> {
    await db.delete(auditEntries);
    for (const a of seedAuditLog) {
      await db.insert(auditEntries).values(a);
    }
    return { success: true, message: "Audit logs reset to seed" };
  }
}
