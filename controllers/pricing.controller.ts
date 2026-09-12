import { eq } from "drizzle-orm";
import { Controller, Route, Tags, Get, Post, Body } from "tsoa";
import { db } from "../database/db.js";
import { pricingConfigs } from "../database/schema.js";
import { seedPricing } from "../database/seed.js";
import type {
  PricingConfigDto,
  PricingListResponse,
} from "../types/pricing.types.js";

@Route("api/v1/pricing")
@Tags("Pricing")
export class PricingController extends Controller {
  @Get("")
  public async getAllPricing(): Promise<PricingListResponse> {
    const list = await db.select().from(pricingConfigs);
    return { success: true, data: list };
  }

  @Post("")
  public async saveAllPricing(@Body() configs: PricingConfigDto[]): Promise<PricingListResponse> {
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
    return { success: true, data: updated };
  }

  @Post("reset")
  public async resetPricing(): Promise<PricingListResponse> {
    await db.delete(pricingConfigs);
    for (const p of seedPricing) {
      await db.insert(pricingConfigs).values(p);
    }
    const updated = await db.select().from(pricingConfigs);
    return { success: true, data: updated };
  }
}
