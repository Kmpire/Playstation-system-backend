import { Router, type Request, type Response, type NextFunction } from "express";
import { ShiftController } from "../controllers/shift.controller.js";

const shiftCtrl = new ShiftController();
const router = Router();

export const getShiftReports = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await shiftCtrl.getShiftReports();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const addShiftReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await shiftCtrl.addShiftReport(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const saveAllShiftReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await shiftCtrl.saveAllShiftReports(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const resetShiftReports = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await shiftCtrl.resetShiftReports();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

router.get("/", getShiftReports);
router.post("/", addShiftReport);
router.post("/batch", saveAllShiftReports);
router.post("/reset", resetShiftReports);

export default router;
