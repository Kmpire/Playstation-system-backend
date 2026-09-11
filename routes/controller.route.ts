import { Router } from "express";
import {
  getAllControllers,
  saveController,
  saveAllControllers,
  resetControllers,
  getMaintenanceRecords,
  addMaintenanceRecord,
  saveAllMaintenanceRecords,
} from "../controllers/controller.controller.js";

const router = Router();

// Controllers
router.get("/", getAllControllers);
router.post("/", saveController);
router.post("/batch", saveAllControllers);
router.post("/reset", resetControllers);

// Maintenance
router.get("/maintenance", getMaintenanceRecords);
router.post("/maintenance", addMaintenanceRecord);
router.post("/maintenance/batch", saveAllMaintenanceRecords);

export default router;
