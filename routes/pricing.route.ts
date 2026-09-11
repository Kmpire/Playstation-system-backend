import { Router } from "express";
import {
  getAllPricing,
  saveAllPricing,
  resetPricing,
} from "../controllers/pricing.controller.js";

const router = Router();

router.get("/", getAllPricing);
router.post("/", saveAllPricing);
router.post("/reset", resetPricing);

export default router;
