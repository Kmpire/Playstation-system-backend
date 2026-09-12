import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { AuditController } from "../controllers/audit.controller.js";

const router = Router();
const auditCtrl = new AuditController();

export const getLogs = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await auditCtrl.getLogs();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const addLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await auditCtrl.addLog(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveAllLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await auditCtrl.saveAllLogs(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetLogs = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await auditCtrl.resetLogs();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

router.get("/", getLogs);
router.post("/", addLog);
router.post("/batch", saveAllLogs);
router.post("/reset", resetLogs);

export default router;
