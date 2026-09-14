import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { ConsoleController } from "../controllers/console.controller.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";

const router = Router();
const consoleCtrl = new ConsoleController();

export const getAllConsoles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consoleCtrl.getAllConsoles();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getConsoleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consoleCtrl.getConsoleById(Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveConsole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consoleCtrl.saveConsole(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveAllConsoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consoleCtrl.saveAllConsoles(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteConsole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consoleCtrl.deleteConsole(Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getAllTabOrders = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consoleCtrl.getAllTabOrders();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getAllSessions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consoleCtrl.getAllSessions();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetConsoles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await consoleCtrl.resetConsoles();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

router.get("/", getAllConsoles);
router.get("/tabs/all", getAllTabOrders);
router.get("/sessions/all", getAllSessions);
router.post("/reset", authorizeRole("admin"), resetConsoles);
router.post("/batch", saveAllConsoles);
router.get("/:id", getConsoleById);
router.post("/", saveConsole);
router.put("/:id", saveConsole);
router.delete("/:id", authorizeRole("admin"), deleteConsole);

export default router;
