import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { CompanyController } from "../controllers/company.controller.js";

const router = Router();
const companyCtrl = new CompanyController();

export const getCompanyInfo = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await companyCtrl.getCompanyInfo();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateCompanyInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await companyCtrl.updateCompanyInfo(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

router.get("/", getCompanyInfo);
router.put("/", updateCompanyInfo);
router.post("/", updateCompanyInfo);

export default router;
