import { asc, eq, and } from "drizzle-orm";
import { Controller, Route, Tags, Get, Post, Put, Delete, Body, Path } from "tsoa";
import { db } from "../database/db.js";
import {
  consoles,
  consoleSessions,
  sessionPriceSegments,
  sessionTabItems,
} from "../database/schema.js";
import { seedConsoles } from "../database/seed.js";
import type {
  ConsoleDto,
  ConsoleResponse,
  ConsoleListResponse,
  ConsoleActionResponse,
  SessionTabItemListResponse,
  ConsoleSessionListResponse,
} from "../types/console.types.js";

async function getConsoleWithSession(consoleId: number): Promise<ConsoleDto | null> {
  const [consoleItem] = await db.select().from(consoles).where(eq(consoles.id, consoleId));
  if (!consoleItem) return null;

  const [session] = await db
    .select()
    .from(consoleSessions)
    .where(and(eq(consoleSessions.consoleId, consoleId), eq(consoleSessions.isActive, true)));

  if (!session) {
    return { ...consoleItem, session: null };
  }

  const priceSegments = await db
    .select()
    .from(sessionPriceSegments)
    .where(eq(sessionPriceSegments.sessionId, session.id));

  const tab = await db
    .select()
    .from(sessionTabItems)
    .where(eq(sessionTabItems.sessionId, session.id));

  return {
    ...consoleItem,
    session: {
      id: session.id,
      mode: session.mode as "prepaid" | "postpaid",
      playerType: session.playerType as "single" | "multi",
      startTime: session.startTime,
      pausedAt: session.pausedAt,
      totalPausedMs: session.totalPausedMs,
      targetDurationMin: session.targetDurationMin,
      priceSegments: priceSegments.map((s) => ({
        playerType: s.playerType,
        startElapsedMs: s.startElapsedMs,
        ratePerHour: s.ratePerHour,
      })),
      tab: tab.map((t) => ({
        id: t.itemId,
        name: t.name,
        nameAr: t.nameAr || undefined,
        price: t.price,
        qty: t.qty,
      })),
    },
  };
}

async function getAllConsolesWithSessions(): Promise<ConsoleDto[]> {
  const allConsoles = await db
    .select()
    .from(consoles)
    .orderBy(asc(consoles.displayOrder), asc(consoles.id));
  const activeSessions = await db
    .select()
    .from(consoleSessions)
    .where(eq(consoleSessions.isActive, true));
  const allPriceSegments = await db.select().from(sessionPriceSegments);
  const allTabs = await db.select().from(sessionTabItems);

  return allConsoles.map((c) => {
    const session = activeSessions.find((s) => s.consoleId === c.id);
    if (!session) {
      return { ...c, session: null };
    }

    const priceSegments = allPriceSegments
      .filter((s) => s.sessionId === session.id)
      .map((s) => ({
        playerType: s.playerType,
        startElapsedMs: s.startElapsedMs,
        ratePerHour: s.ratePerHour,
      }));

    const tab = allTabs
      .filter((t) => t.sessionId === session.id)
      .map((t) => ({
        id: t.itemId,
        name: t.name,
        nameAr: t.nameAr || undefined,
        price: t.price,
        qty: t.qty,
      }));

    return {
      ...c,
      session: {
        id: session.id,
        mode: session.mode as "prepaid" | "postpaid",
        playerType: session.playerType as "single" | "multi",
        startTime: session.startTime,
        pausedAt: session.pausedAt,
        totalPausedMs: session.totalPausedMs,
        targetDurationMin: session.targetDurationMin,
        priceSegments,
        tab,
      },
    };
  });
}

async function persistSessionData(consoleId: number, sessionData: any) {
  await db
    .update(consoleSessions)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(consoleSessions.consoleId, consoleId), eq(consoleSessions.isActive, true)));

  if (!sessionData) return;

  const [newSession] = await db
    .insert(consoleSessions)
    .values({
      consoleId,
      mode: sessionData.mode || "postpaid",
      playerType: sessionData.playerType || "single",
      startTime: Number(sessionData.startTime) || Date.now(),
      pausedAt: sessionData.pausedAt !== undefined ? sessionData.pausedAt : null,
      totalPausedMs: Number(sessionData.totalPausedMs) || 0,
      targetDurationMin: sessionData.targetDurationMin ? Number(sessionData.targetDurationMin) : null,
      isActive: true,
    })
    .returning();

  if (newSession) {
    if (Array.isArray(sessionData.priceSegments)) {
      for (const seg of sessionData.priceSegments) {
        await db.insert(sessionPriceSegments).values({
          sessionId: newSession.id,
          playerType: seg.playerType || "single",
          startElapsedMs: Number(seg.startElapsedMs) || 0,
          ratePerHour: Number(seg.ratePerHour) || 0,
        });
      }
    }

    if (Array.isArray(sessionData.tab)) {
      for (const tab of sessionData.tab) {
        await db.insert(sessionTabItems).values({
          sessionId: newSession.id,
          itemId: String(tab.id),
          name: String(tab.name),
          nameAr: tab.nameAr ? String(tab.nameAr) : null,
          price: Number(tab.price) || 0,
          qty: Number(tab.qty) || 1,
        });
      }
    }
  }
}

@Route("api/v1/consoles")
@Tags("Consoles")
export class ConsoleController extends Controller {
  @Get("")
  public async getAllConsoles(): Promise<ConsoleListResponse> {
    const list = await getAllConsolesWithSessions();
    return { success: true, data: list };
  }

  @Get("tabs/all")
  public async getAllTabOrders(): Promise<SessionTabItemListResponse> {
    const list = await db.select().from(sessionTabItems);
    return { success: true, data: list };
  }

  @Get("sessions/all")
  public async getAllSessions(): Promise<ConsoleSessionListResponse> {
    const list = await db.select().from(consoleSessions);
    return { success: true, data: list as any };
  }

  @Get("{id}")
  public async getConsoleById(@Path() id: number): Promise<ConsoleResponse> {
    const item = await getConsoleWithSession(id);
    if (!item) {
      this.setStatus(404);
      throw new Error("Console not found");
    }
    return { success: true, data: item };
  }

  @Post("")
  public async saveConsole(@Body() consoleData: ConsoleDto): Promise<ConsoleResponse> {
    const id = Number(consoleData.id);
    const [existing] = await db.select().from(consoles).where(eq(consoles.id, id));

    if (existing) {
      await db
        .update(consoles)
        .set({
          name: consoleData.name,
          type: consoleData.type,
          status: consoleData.status,
          dailyTotal: consoleData.dailyTotal ?? existing.dailyTotal,
          displayOrder:
            consoleData.displayOrder !== undefined
              ? consoleData.displayOrder
              : existing.displayOrder,
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
        displayOrder: consoleData.displayOrder ?? 0,
      });
    }

    if (consoleData.status === "available" || consoleData.session === null) {
      await persistSessionData(id, null);
    } else if (consoleData.session !== undefined) {
      await persistSessionData(id, consoleData.session);
    }

    const updated = await getConsoleWithSession(id);
    return { success: true, data: updated! };
  }

  @Put("{id}")
  public async updateConsole(@Path() id: number, @Body() consoleData: ConsoleDto): Promise<ConsoleResponse> {
    return this.saveConsole({ ...consoleData, id });
  }

  @Post("batch")
  public async saveAllConsoles(@Body() items: ConsoleDto[]): Promise<ConsoleListResponse> {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await this.saveConsole({
        ...item,
        displayOrder: item.displayOrder !== undefined ? item.displayOrder : i,
      });
    }
    const list = await getAllConsolesWithSessions();
    return { success: true, data: list };
  }

  @Post("reset")
  public async resetConsoles(): Promise<ConsoleListResponse> {
    await db.delete(sessionPriceSegments);
    await db.delete(sessionTabItems);
    await db.delete(consoleSessions);
    await db.delete(consoles);

    for (const con of seedConsoles) {
      await db.insert(consoles).values({
        id: con.id,
        name: con.name,
        type: con.type,
        status: con.status,
        dailyTotal: con.dailyTotal,
      });

      if (con.session) {
        await persistSessionData(con.id, con.session);
      }
    }

    const list = await getAllConsolesWithSessions();
    return { success: true, data: list };
  }

  @Delete("{id}")
  public async deleteConsole(@Path() id: number): Promise<ConsoleActionResponse> {
    await db.delete(consoles).where(eq(consoles.id, id));
    return { success: true, message: `Console #${id} deleted` };
  }
}
