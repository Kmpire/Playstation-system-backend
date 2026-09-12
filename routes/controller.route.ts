import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { GamepadController } from "../controllers/controller.controller.js";

const router = Router();
const padCtrl = new GamepadController();

export const getAllControllers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await padCtrl.getAllControllers();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await padCtrl.saveController(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveAllControllers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await padCtrl.saveAllControllers(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetControllers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await padCtrl.resetControllers();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMaintenanceRecords = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await padCtrl.getMaintenanceRecords();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const addMaintenanceRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await padCtrl.addMaintenanceRecord(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveAllMaintenanceRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await padCtrl.saveAllMaintenanceRecords(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await padCtrl.deleteController(req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteMaintenanceRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await padCtrl.deleteMaintenanceRecord(req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Controllers
router.get("/", getAllControllers);
router.post("/", saveController);
router.post("/batch", saveAllControllers);
router.post("/reset", resetControllers);
router.delete("/:id", deleteController);

// Maintenance
router.get("/maintenance", getMaintenanceRecords);
router.post("/maintenance", addMaintenanceRecord);
router.post("/maintenance/batch", saveAllMaintenanceRecords);
router.delete("/maintenance/:id", deleteMaintenanceRecord);

export default router;
