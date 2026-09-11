import { Router } from "express";
import {
  getCompanyInfo,
  updateCompanyInfo,
} from "../controllers/company.controller.js";

const router = Router();

router.get("/", getCompanyInfo);
router.put("/", updateCompanyInfo);
router.post("/", updateCompanyInfo);

export default router;
