import { Router, type Request, type Response, type NextFunction } from "express";
import { PaymentMethodController } from "../controllers/payment-method.controller.js";

const ctrl = new PaymentMethodController();
const router = Router();

export const getAllPaymentMethods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ctrl.getAllPaymentMethods();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getPaymentMethodById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ctrl.getPaymentMethodById(String(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createPaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ctrl.createPaymentMethod(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updatePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ctrl.updatePaymentMethod(String(req.params.id), req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deletePaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ctrl.deletePaymentMethod(String(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

router.get("/", getAllPaymentMethods);
router.get("/:id", getPaymentMethodById);
router.post("/", createPaymentMethod);
router.put("/:id", updatePaymentMethod);
router.delete("/:id", deletePaymentMethod);

export default router;
