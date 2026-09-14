import { eq, asc, and } from "drizzle-orm";
import { Controller, Route, Tags, Get, Post, Put, Delete, Body, Path } from "tsoa";
import { db } from "../database/db.js";
import { paymentMethods } from "../database/schema.js";
import type {
  PaymentMethodDto,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  PaymentMethodResponse,
  PaymentMethodListResponse,
} from "../types/payment.types.js";

function createHttpError(statusCode: number, message: string) {
  const err = new Error(message);
  (err as any).statusCode = statusCode;
  return err;
}

@Route("api/v1/payment-methods")
@Tags("PaymentMethods")
export class PaymentMethodController extends Controller {
  @Get("")
  public async getAllPaymentMethods(): Promise<PaymentMethodListResponse> {
    const list = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.isActive, true))
      .orderBy(asc(paymentMethods.displayOrder));

    return { success: true, data: list as PaymentMethodDto[] };
  }

  @Get("{id}")
  public async getPaymentMethodById(@Path() id: string): Promise<PaymentMethodResponse> {
    const [item] = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id));

    if (!item) {
      this.setStatus(404);
      throw createHttpError(404, "Payment method not found");
    }

    return { success: true, data: item as PaymentMethodDto };
  }

  @Post("")
  public async createPaymentMethod(
    @Body() body: CreatePaymentMethodDto,
  ): Promise<PaymentMethodResponse> {
    const id = body.id || `pm_${Date.now()}`;
    const name = body.name?.trim();
    const nameAr = body.nameAr?.trim() || name;

    if (!name) {
      this.setStatus(400);
      throw createHttpError(400, "Payment method name is required");
    }

    const [existing] = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id));

    if (existing) {
      this.setStatus(400);
      throw createHttpError(400, `Payment method with id '${id}' already exists`);
    }

    const isCash = Boolean(body.isCash);

    const [created] = await db
      .insert(paymentMethods)
      .values({
        id,
        name,
        nameAr,
        type: body.type || (isCash ? "cash" : "custom"),
        isCash,
        isProtected: false, // User-created methods are not protected
        isActive: true,
        displayOrder: body.displayOrder ?? 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return { success: true, data: created as PaymentMethodDto };
  }

  @Put("{id}")
  public async updatePaymentMethod(
    @Path() id: string,
    @Body() body: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodResponse> {
    const [existing] = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id));

    if (!existing) {
      this.setStatus(404);
      throw createHttpError(404, "Payment method not found");
    }

    // Protection rule: Cash must always remain cash and active
    if (existing.isProtected || existing.id === "pm_cash") {
      if (body.isActive === false) {
        this.setStatus(400);
        throw createHttpError(
          400,
          "لا يمكن تعطيل طريقة الدفع الأساسية (كاش) / Cash payment method cannot be disabled",
        );
      }
      if (body.isCash === false) {
        this.setStatus(400);
        throw createHttpError(
          400,
          "طريقة الدفع (كاش) يجب أن تظل نقدية دائماً / Cash payment method must remain cash",
        );
      }
    }

    const [updated] = await db
      .update(paymentMethods)
      .set({
        name: body.name !== undefined ? body.name.trim() : existing.name,
        nameAr: body.nameAr !== undefined ? body.nameAr.trim() : existing.nameAr,
        type: body.type !== undefined ? body.type : existing.type,
        isCash: existing.isProtected ? true : (body.isCash !== undefined ? body.isCash : existing.isCash),
        isActive: existing.isProtected ? true : (body.isActive !== undefined ? body.isActive : existing.isActive),
        displayOrder: body.displayOrder !== undefined ? body.displayOrder : existing.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(paymentMethods.id, id))
      .returning();

    return { success: true, data: updated as PaymentMethodDto };
  }

  @Delete("{id}")
  public async deletePaymentMethod(
    @Path() id: string,
  ): Promise<{ success: boolean; message: string }> {
    const [existing] = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id));

    if (!existing) {
      this.setStatus(404);
      throw createHttpError(404, "Payment method not found");
    }

    // Critical backend validation: PROTECTED CASH CANNOT BE DELETED
    if (
      existing.isProtected ||
      existing.id === "pm_cash" ||
      existing.type === "cash" ||
      existing.name.toLowerCase() === "cash"
    ) {
      this.setStatus(400);
      throw createHttpError(
        400,
        "لا يمكن حذف طريقة الدفع الأساسية (كاش) إطلاقاً / Cannot delete protected Cash payment method",
      );
    }

    // Also verify at least one payment method remains
    const allActive = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.isActive, true));

    if (allActive.length <= 1) {
      this.setStatus(400);
      throw createHttpError(
        400,
        "يجب الإبقاء على طريقة دفع واحدة على الأقل في النظام / Must keep at least one payment method in the system",
      );
    }

    // Delete method
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));

    return { success: true, message: `Payment method '${existing.name}' deleted successfully` };
  }
}
