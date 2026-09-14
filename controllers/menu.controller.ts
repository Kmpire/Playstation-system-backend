import { eq, and, sql } from "drizzle-orm";
import { Controller, Route, Tags, Get, Post, Put, Delete, Body, Path } from "tsoa";
import { db } from "../database/db.js";
import { menuItems, categories } from "../database/schema.js";
import { seedMenuItems, seedCategories } from "../database/seed.js";
import type {
  MenuItemDto,
  CategoryDto,
  DeductStockItemDto,
  MenuItemListResponse,
  MenuItemResponse,
  CategoryListResponse,
  CategoryResponse,
  MenuActionResponse,
} from "../types/menu.types.js";

@Route("api/v1/menu")
@Tags("Menu Items")
export class MenuItemController extends Controller {
  @Get("items")
  public async getItems(): Promise<MenuItemListResponse> {
    const items = await db.select().from(menuItems);
    return { success: true, data: items };
  }

  @Post("items")
  public async saveItem(@Body() item: MenuItemDto): Promise<MenuItemResponse> {
    const finalNameAr = item.nameAr?.trim() || item.name?.trim() || "";
    const finalName = item.name?.trim() || finalNameAr;

    const [existing] = await db.select().from(menuItems).where(eq(menuItems.id, item.id));

    if (existing) {
      await db
        .update(menuItems)
        .set({
          name: finalName,
          nameAr: finalNameAr,
          category: item.category,
          price: item.price,
          costPrice: item.costPrice ?? existing.costPrice,
          stock: item.stock ?? existing.stock,
          lowStockThreshold: item.lowStockThreshold ?? existing.lowStockThreshold,
          trackStock: item.trackStock !== undefined ? item.trackStock : existing.trackStock,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, item.id));
    } else {
      await db.insert(menuItems).values({
        id: item.id,
        name: finalName,
        nameAr: finalNameAr,
        category: item.category,
        price: item.price,
        costPrice: item.costPrice || 0,
        stock: item.stock || 0,
        lowStockThreshold: item.lowStockThreshold || 5,
        trackStock: item.trackStock !== undefined ? item.trackStock : true,
      });
    }

    const [updated] = await db.select().from(menuItems).where(eq(menuItems.id, item.id));
    return { success: true, data: updated };
  }

  @Put("items/{id}")
  public async updateItem(@Path() id: string, @Body() item: MenuItemDto): Promise<MenuItemResponse> {
    return this.saveItem({ ...item, id });
  }

  @Post("items/deduct-stock")
  public async deductStock(@Body() deductions: DeductStockItemDto[]): Promise<MenuActionResponse> {
    const rawItems = Array.isArray(deductions) ? deductions : [];
    const valid = rawItems.filter((i) => i && i.id && i.qty > 0);

    if (valid.length > 0) {
      await Promise.all(
        valid.map((item) =>
          db
            .update(menuItems)
            .set({
              stock: sql`GREATEST(0, ${menuItems.stock} - ${item.qty})`,
              updatedAt: new Date(),
            })
            .where(and(eq(menuItems.id, item.id), eq(menuItems.trackStock, true)))
        )
      );
    }

    return { success: true, message: "Stock deducted successfully" };
  }

  @Post("items/batch")
  public async saveAllItems(@Body() items: MenuItemDto[]): Promise<MenuItemListResponse> {
    if (items && items.length > 0) {
      await Promise.all(
        items.map(async (item) => {
          const finalNameAr = item.nameAr?.trim() || item.name?.trim() || "";
          const finalName = item.name?.trim() || finalNameAr;
          await db
            .insert(menuItems)
            .values({
              id: item.id,
              name: finalName,
              nameAr: finalNameAr,
              category: item.category,
              price: item.price,
              costPrice: item.costPrice || 0,
              stock: item.stock || 0,
              lowStockThreshold: item.lowStockThreshold || 5,
              trackStock: item.trackStock !== undefined ? item.trackStock : true,
            })
            .onConflictDoUpdate({
              target: menuItems.id,
              set: {
                name: finalName,
                nameAr: finalNameAr,
                category: item.category,
                price: item.price,
                costPrice: item.costPrice || 0,
                stock: item.stock || 0,
                lowStockThreshold: item.lowStockThreshold || 5,
                trackStock: item.trackStock !== undefined ? item.trackStock : true,
                updatedAt: new Date(),
              },
            });
        })
      );
    }
    const all = await db.select().from(menuItems);
    return { success: true, data: all };
  }

  @Post("items/reset")
  public async resetItems(): Promise<MenuItemListResponse> {
    await db.delete(menuItems);
    for (const m of seedMenuItems) {
      await db.insert(menuItems).values(m);
    }
    const all = await db.select().from(menuItems);
    return { success: true, data: all };
  }

  @Delete("items/{id}")
  public async deleteItem(@Path() id: string): Promise<MenuActionResponse> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return { success: true, message: `Item #${id} deleted` };
  }
}

@Route("api/v1/menu")
@Tags("Menu Categories")
export class CategoryController extends Controller {
  @Get("categories")
  public async getCategories(): Promise<CategoryListResponse> {
    const cats = await db.select().from(categories);
    return { success: true, data: cats };
  }

  @Post("categories")
  public async saveCategory(@Body() category: CategoryDto): Promise<CategoryResponse> {
    const [existing] = await db.select().from(categories).where(eq(categories.id, category.id));
    if (existing) {
      await db
        .update(categories)
        .set({ name: category.name, nameAr: category.nameAr })
        .where(eq(categories.id, category.id));
    } else {
      await db.insert(categories).values({
        id: category.id,
        name: category.name,
        nameAr: category.nameAr,
      });
    }

    const [updated] = await db.select().from(categories).where(eq(categories.id, category.id));
    return { success: true, data: updated };
  }

  @Post("categories/batch")
  public async saveAllCategories(@Body() cats: CategoryDto[]): Promise<CategoryListResponse> {
    for (const cat of cats) {
      await this.saveCategory(cat);
    }
    const all = await db.select().from(categories);
    return { success: true, data: all };
  }

  @Post("categories/reset")
  public async resetCategories(): Promise<CategoryListResponse> {
    await db.delete(categories);
    for (const c of seedCategories) {
      await db.insert(categories).values(c);
    }
    const all = await db.select().from(categories);
    return { success: true, data: all };
  }

  @Delete("categories/{id}")
  public async deleteCategory(@Path() id: string): Promise<MenuActionResponse> {
    await db.delete(categories).where(eq(categories.id, id));
    return { success: true, message: `Category #${id} deleted` };
  }
}
