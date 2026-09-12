import { eq } from "drizzle-orm";
import { Controller, Route, Tags, Get, Post, Put, Body, Path } from "tsoa";
import { db } from "../database/db.js";
import { appSettings } from "../database/schema.js";
import type {
  SettingValueDto,
  SettingResponse,
  SettingActionResponse,
} from "../types/settings.types.js";

@Route("api/v1/settings")
@Tags("Settings")
export class SettingsController extends Controller {
  @Get("{key}")
  public async getSetting(@Path() key: string): Promise<SettingResponse> {
    const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key));
    return { success: true, value: setting ? setting.value : null };
  }

  @Post("{key}")
  public async setSetting(@Path() key: string, @Body() body: SettingValueDto): Promise<SettingActionResponse> {
    const [existing] = await db.select().from(appSettings).where(eq(appSettings.key, key));

    if (existing) {
      await db
        .update(appSettings)
        .set({ value: String(body.value), updatedAt: new Date() })
        .where(eq(appSettings.key, key));
    } else {
      await db.insert(appSettings).values({ key, value: String(body.value) });
    }

    return { success: true, message: `Setting '${key}' saved` };
  }

  @Put("{key}")
  public async updateSetting(@Path() key: string, @Body() body: SettingValueDto): Promise<SettingActionResponse> {
    return this.setSetting(key, body);
  }
}
