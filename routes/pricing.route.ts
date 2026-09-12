import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { PricingController } from "../controllers/pricing.controller.js";

const router = Router();
const pricingCtrl = new PricingController();

export const getAllPricing = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pricingCtrl.getAllPricing();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveAllPricing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pricingCtrl.saveAllPricing(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetPricing = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pricingCtrl.resetPricing();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

router.get("/", getAllPricing);
router.post("/", saveAllPricing);
router.post("/reset", resetPricing);

export default router;
