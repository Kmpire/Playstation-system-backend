import { Router, type Request, type Response, type NextFunction } from "express";
import { PaymentController } from "../controllers/payment.controller.js";

const ctrl = new PaymentController();
const router = Router();

export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.query.sessionId !== undefined ? Number(req.query.sessionId) : undefined;
    const consoleId = req.query.consoleId !== undefined ? Number(req.query.consoleId) : undefined;
    const orderId = req.query.orderId !== undefined ? String(req.query.orderId) : undefined;
    const isCash = req.query.isCash !== undefined ? req.query.isCash === "true" : undefined;

    const result = await ctrl.getPayments(sessionId, consoleId, orderId, isCash);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const processPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ctrl.processPayments(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getPaymentsSummary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ctrl.getPaymentsSummary();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

router.get("/summary", getPaymentsSummary);
router.get("/", getPayments);
router.post("/", processPayments);

export default router;
