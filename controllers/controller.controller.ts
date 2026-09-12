import { eq } from "drizzle-orm";
import { Controller, Route, Tags, Get, Post, Body } from "tsoa";
import { db } from "../database/db.js";
import { controllers, maintenanceRecords } from "../database/schema.js";
import { seedControllers, seedMaintenanceRecords } from "../database/seed.js";
import type {
  GamepadDto,
  MaintenanceRecordDto,
  GamepadListResponse,
  GamepadResponse,
  MaintenanceListResponse,
  MaintenanceResponse,
} from "../types/controller.types.js";

@Route("api/v1/controllers")
@Tags("Controllers")
export class GamepadController extends Controller {
  @Get("")
  public async getAllControllers(): Promise<GamepadListResponse> {
    const list = await db.select().from(controllers);
    return { success: true, data: list };
  }

  @Post("")
  public async saveController(@Body() item: GamepadDto): Promise<GamepadResponse> {
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
    return { success: true, data: updated };
  }

  @Post("batch")
  public async saveAllControllers(@Body() list: GamepadDto[]): Promise<GamepadListResponse> {
    for (const item of list) {
      await this.saveController(item);
    }
    const all = await db.select().from(controllers);
    return { success: true, data: all };
  }

  @Post("reset")
  public async resetControllers(): Promise<GamepadListResponse> {
    await db.delete(controllers);
    for (const c of seedControllers) {
      await db.insert(controllers).values(c);
    }
    const all = await db.select().from(controllers);
    return { success: true, data: all };
  }

  @Get("maintenance")
  public async getMaintenanceRecords(): Promise<MaintenanceListResponse> {
    const list = await db.select().from(maintenanceRecords);
    return { success: true, data: list };
  }

  @Post("maintenance")
  public async addMaintenanceRecord(@Body() record: MaintenanceRecordDto): Promise<MaintenanceResponse> {
    await db.insert(maintenanceRecords).values({
      id: record.id || "mr_" + Date.now(),
      date: record.date,
      targetType: record.targetType,
      targetId: record.targetId,
      targetLabel: record.targetLabel,
      issue: record.issue,
      cost: record.cost || 0,
      resolvedBy: record.resolvedBy,
    });
    const [inserted] = await db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.id, record.id));
    return { success: true, data: inserted };
  }

  @Post("maintenance/batch")
  public async saveAllMaintenanceRecords(@Body() list: MaintenanceRecordDto[]): Promise<MaintenanceListResponse> {
    for (const record of list) {
      const [existing] = await db
        .select()
        .from(maintenanceRecords)
        .where(eq(maintenanceRecords.id, record.id));

      if (existing) {
        await db
          .update(maintenanceRecords)
          .set({
            date: record.date,
            targetType: record.targetType,
            targetId: record.targetId,
            targetLabel: record.targetLabel,
            issue: record.issue,
            cost: record.cost,
            resolvedBy: record.resolvedBy,
          })
          .where(eq(maintenanceRecords.id, record.id));
      } else {
        await db.insert(maintenanceRecords).values({
          id: record.id || "mr_" + Date.now(),
          date: record.date,
          targetType: record.targetType,
          targetId: record.targetId,
          targetLabel: record.targetLabel,
          issue: record.issue,
          cost: record.cost || 0,
          resolvedBy: record.resolvedBy,
        });
      }
    }
    const all = await db.select().from(maintenanceRecords);
    return { success: true, data: all };
  }
}
