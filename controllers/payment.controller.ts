import { eq, desc, and } from "drizzle-orm";
import { Controller, Route, Tags, Get, Post, Body, Query } from "tsoa";
import { db } from "../database/db.js";
import { payments, paymentMethods } from "../database/schema.js";
import type {
  ProcessPaymentDto,
  PaymentRecordDto,
  PaymentListResponse,
  PaymentSummaryResponse,
} from "../types/payment.types.js";

@Route("api/v1/payments")
@Tags("Payments")
export class PaymentController extends Controller {
  @Get("")
  public async getPayments(
    @Query() sessionId?: number,
    @Query() consoleId?: number,
    @Query() orderId?: string,
    @Query() isCash?: boolean,
  ): Promise<PaymentListResponse> {
    const conditions = [];

    if (sessionId !== undefined) {
      conditions.push(eq(payments.sessionId, sessionId));
    }
    if (consoleId !== undefined) {
      conditions.push(eq(payments.consoleId, consoleId));
    }
    if (orderId !== undefined) {
      conditions.push(eq(payments.orderId, orderId));
    }
    if (isCash !== undefined) {
      conditions.push(eq(payments.isCash, isCash));
    }

    const query = db.select().from(payments);
    const list =
      conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(payments.createdAt))
        : await query.orderBy(desc(payments.createdAt));

    return { success: true, data: list as PaymentRecordDto[] };
  }

  @Post("")
  public async processPayments(
    @Body() body: ProcessPaymentDto,
  ): Promise<PaymentListResponse> {
    if (!body.payments || body.payments.length === 0) {
      this.setStatus(400);
      throw new Error("No payment splits provided");
    }

    // Get all payment methods to resolve names and isCash flag
    const allMethods = await db.select().from(paymentMethods);
    const methodMap = new Map(allMethods.map((m) => [m.id, m]));

    const recordsToInsert = body.payments
      .filter((p) => p.amount > 0)
      .map((split) => {
        const method = methodMap.get(split.paymentMethodId);
        const isCash = method ? method.isCash : split.paymentMethodId === "pm_cash";
        const name = method ? method.nameAr || method.name : "Cash";

        return {
          sessionId: body.sessionId || null,
          consoleId: body.consoleId || null,
          orderId: body.orderId || null,
          paymentMethodId: split.paymentMethodId,
          paymentMethodName: name,
          amount: Number(split.amount),
          isCash,
          staff: body.staff || "Cashier",
          notes: body.notes || null,
          createdAt: new Date(),
        };
      });

    if (recordsToInsert.length === 0) {
      this.setStatus(400);
      throw new Error("Payment amounts must be greater than zero");
    }

    const inserted = await db.insert(payments).values(recordsToInsert).returning();

    return { success: true, data: inserted as PaymentRecordDto[] };
  }

  @Get("summary")
  public async getPaymentsSummary(): Promise<PaymentSummaryResponse> {
    const allPayments = await db.select().from(payments);
    const allMethods = await db.select().from(paymentMethods);
    const methodMap = new Map(allMethods.map((m) => [m.id, m]));

    let totalRevenue = 0;
    let cashTotal = 0;
    let nonCashTotal = 0;

    const breakdownMap: Record<
      string,
      {
        paymentMethodId: string;
        name: string;
        nameAr: string;
        amount: number;
        count: number;
        isCash: boolean;
      }
    > = {};

    // Initialize with existing active methods
    for (const m of allMethods) {
      breakdownMap[m.id] = {
        paymentMethodId: m.id,
        name: m.name,
        nameAr: m.nameAr,
        amount: 0,
        count: 0,
        isCash: m.isCash,
      };
    }

    for (const p of allPayments) {
      const amt = Number(p.amount) || 0;
      totalRevenue += amt;
      if (p.isCash) {
        cashTotal += amt;
      } else {
        nonCashTotal += amt;
      }

      if (!breakdownMap[p.paymentMethodId]) {
        const m = methodMap.get(p.paymentMethodId);
        breakdownMap[p.paymentMethodId] = {
          paymentMethodId: p.paymentMethodId,
          name: m?.name || p.paymentMethodName,
          nameAr: m?.nameAr || p.paymentMethodName,
          amount: 0,
          count: 0,
          isCash: p.isCash,
        };
      }

      breakdownMap[p.paymentMethodId].amount += amt;
      breakdownMap[p.paymentMethodId].count += 1;
    }

    return {
      success: true,
      data: {
        totalRevenue,
        cashTotal,
        nonCashTotal,
        breakdown: Object.values(breakdownMap),
      },
    };
  }
}
