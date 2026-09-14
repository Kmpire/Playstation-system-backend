import { eq } from "drizzle-orm";
import { Controller, Route, Tags, Get, Post, Body } from "tsoa";
import { db } from "../database/db.js";
import { appSettings } from "../database/schema.js";
import type {
  PricingPayloadDto,
  PricingResponse,
  PricingTierDto,
  PricingConfigDto,
} from "../types/pricing.types.js";

const DEFAULT_TIERS: PricingTierDto[] = [
  { id: "single", name: "Single", nameAr: "فردي" },
  { id: "multi", name: "Multi", nameAr: "مالتي" },
];

const DEFAULT_CONFIGS: PricingConfigDto[] = [
  { type: "PS5", rates: { single: 40, multi: 55 } },
  { type: "PS4", rates: { single: 25, multi: 35 } },
  { type: "Xbox", rates: { single: 30, multi: 45 } },
  { type: "VIP", rates: { single: 60, multi: 85 } },
];

const SETTINGS_KEY = "pricing_data";

@Route("api/v1/pricing")
@Tags("Pricing")
export class PricingController extends Controller {
  @Get("")
  public async getAllPricing(): Promise<PricingResponse> {
    const [existing] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, SETTINGS_KEY));

    if (existing && existing.value) {
      try {
        const parsed = JSON.parse(existing.value);
        if (parsed?.tiers?.length > 0 && Array.isArray(parsed?.configs)) {
          return { success: true, data: parsed };
        }
      } catch {
        // Corrupted JSON, reinitialize
      }
    }

    const initialData: PricingPayloadDto = {
      tiers: DEFAULT_TIERS,
      configs: DEFAULT_CONFIGS,
    };

    if (existing) {
      await db
        .update(appSettings)
        .set({ value: JSON.stringify(initialData), updatedAt: new Date() })
        .where(eq(appSettings.key, SETTINGS_KEY));
    } else {
      await db.insert(appSettings).values({
        key: SETTINGS_KEY,
        value: JSON.stringify(initialData),
      });
    }

    return { success: true, data: initialData };
  }

  @Post("")
  public async saveAllPricing(@Body() payload: PricingPayloadDto): Promise<PricingResponse> {
    if (!payload.tiers || payload.tiers.length === 0) {
      this.setStatus(400);
      throw new Error("At least one pricing type must exist");
    }

    const dataToSave: PricingPayloadDto = {
      tiers: payload.tiers,
      configs: payload.configs || [],
    };

    const [existing] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, SETTINGS_KEY));

    if (existing) {
      await db
        .update(appSettings)
        .set({ value: JSON.stringify(dataToSave), updatedAt: new Date() })
        .where(eq(appSettings.key, SETTINGS_KEY));
    } else {
      await db.insert(appSettings).values({
        key: SETTINGS_KEY,
        value: JSON.stringify(dataToSave),
      });
    }

    return { success: true, data: dataToSave };
  }

  @Post("reset")
  public async resetPricing(): Promise<PricingResponse> {
    const defaultData: PricingPayloadDto = {
      tiers: DEFAULT_TIERS,
      configs: DEFAULT_CONFIGS,
    };

    const [existing] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, SETTINGS_KEY));

    if (existing) {
      await db
        .update(appSettings)
        .set({ value: JSON.stringify(defaultData), updatedAt: new Date() })
        .where(eq(appSettings.key, SETTINGS_KEY));
    } else {
      await db.insert(appSettings).values({
        key: SETTINGS_KEY,
        value: JSON.stringify(defaultData),
      });
    }

    return { success: true, data: defaultData };
  }
}

